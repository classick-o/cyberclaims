// DEV-TIME prepper for the WordPress import. Runs LOCALLY, once, while the old
// wordpress site (www.cyberclaims.net) is still online.
//
//   node backend/scripts/prepare-articles.mjs
//
// It reads backend/scripts/seed/wordpress-export.xml (the WXR export) and produces two
// things next to it, both committed so the seeder never needs the internet:
//
//   seed/uploads/<yyyy>/<mm>/<id>-<w>.webp   — every image, re-encoded to WebP in the
//                                              same 480/960/1600 variants the CMS makes
//   seed/manifest.json                       — authors, categories, media rows, and posts
//                                              (Gutenberg stripped, image URLs rewritten
//                                              to the local /uploads/ paths)
//
// The server-side seeder (seed-articles.js) then just copies the WebP into UPLOAD_DIR
// and inserts the manifest — no downloads, no image processing on the box.

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const SEED = join(HERE, 'seed');
const XML_PATH = join(SEED, 'wordpress-export.xml');
// Local staging mirror of the server's uploads/. Named "media" (not "uploads") so the
// deploy staging, which excludes any dir called uploads, still bundles it.
const UPLOADS = join(SEED, 'media');
const WIDTHS = [480, 960, 1600];
const WP_HOST = 'https://www.cyberclaims.net';

const xml = await readFile(XML_PATH, 'utf8');

// ── tiny WXR helpers ────────────────────────────────────────────────────────
const stripCdata = (s) =>
  s == null ? null : s.replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();

function firstTag(block, name) {
  const re = new RegExp(`<${name.replace(':', '\\:')}[^>]*>([\\s\\S]*?)</${name.replace(':', '\\:')}>`);
  const m = block.match(re);
  return m ? stripCdata(m[1]) : null;
}
function allMatches(text, re) {
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) out.push(m);
  return out;
}

// Normalise a WP image URL to its original by dropping the -WxH size suffix.
const originalUrl = (url) => url.replace(/-\d+x\d+(\.(?:jpe?g|png|gif|webp|avif))$/i, '$1');

// Minimal HTML-entity decode for scraped <title>/description text.
const decodeHtml = (s) =>
  String(s ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;|&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .trim();

// Fetch a live article page and pull the AIOSEO-rendered <title> + meta description.
// This is the authoritative production SEO (the export's per-article AIOSEO fields are
// all empty — the live values come from AIOSEO's template, resolved server-side).
async function liveSeo(link) {
  if (!link) return { seo_title: null, seo_description: null };
  try {
    const res = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0 CyberclaimsImporter' } });
    if (!res.ok) return { seo_title: null, seo_description: null };
    const page = await res.text();
    const t = page.match(/<title>([^<]*)<\/title>/i);
    const d = page.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
    return {
      seo_title: t ? decodeHtml(t[1]).slice(0, 255) : null,
      seo_description: d ? decodeHtml(d[1]).slice(0, 320) : null,
    };
  } catch {
    return { seo_title: null, seo_description: null };
  }
}

// yyyy/mm from a /wp-content/uploads/2024/10/... path (fallback to a stable default).
function ymFromUrl(url) {
  const m = url.match(/\/uploads\/(\d{4})\/(\d{2})\//);
  return m ? `${m[1]}/${m[2]}` : '2024/10';
}

// ── parse authors ───────────────────────────────────────────────────────────
const authorsByLogin = {};
for (const m of allMatches(xml, /<wp:author>([\s\S]*?)<\/wp:author>/g)) {
  const login = firstTag(m[1], 'wp:author_login');
  const display = firstTag(m[1], 'wp:author_display_name') || login;
  if (login) authorsByLogin[login] = display;
}

// ── split items ─────────────────────────────────────────────────────────────
const items = allMatches(xml, /<item>([\s\S]*?)<\/item>/g).map((m) => m[1]);

// postmeta extractor
function postmeta(block, key) {
  const re = new RegExp(
    `<wp:postmeta>\\s*<wp:meta_key>(?:<!\\[CDATA\\[)?${key}(?:\\]\\]>)?</wp:meta_key>\\s*<wp:meta_value>([\\s\\S]*?)</wp:meta_value>`
  );
  const m = block.match(re);
  return m ? stripCdata(m[1]) : null;
}

// ── attachments: id -> { url, alt } ─────────────────────────────────────────
const attachments = {};
for (const block of items) {
  if (firstTag(block, 'wp:post_type') !== 'attachment') continue;
  const id = firstTag(block, 'wp:post_id');
  const url = firstTag(block, 'wp:attachment_url');
  if (!id || !url) continue;
  attachments[id] = { url: originalUrl(url), alt: postmeta(block, '_wp_attachment_image_alt') || '' };
}

// ── collect every image URL we need (attachments + inline <img src>) ─────────
const wanted = new Map(); // originalUrl -> { alt }
for (const a of Object.values(attachments)) wanted.set(a.url, { alt: a.alt });

const postItems = items.filter((b) => firstTag(b, 'wp:post_type') === 'post');
for (const block of postItems) {
  const content = stripCdata(firstTag(block, 'content:encoded') ?? '') ?? '';
  for (const m of allMatches(content, /<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)) {
    let url = m[1];
    if (url.startsWith('/')) url = WP_HOST + url;
    if (!/\/wp-content\/uploads\//.test(url)) continue;
    const orig = originalUrl(url);
    if (!wanted.has(orig)) wanted.set(orig, { alt: '' });
  }
}

// ── download + re-encode every image ────────────────────────────────────────
if (existsSync(UPLOADS)) await rm(UPLOADS, { recursive: true, force: true });

async function fetchBuffer(url) {
  for (const candidate of [url]) {
    try {
      const res = await fetch(candidate);
      if (res.ok) return Buffer.from(await res.arrayBuffer());
    } catch {
      /* try next */
    }
  }
  return null;
}

const mediaByUrl = new Map(); // originalUrl -> media entry (with localId)
let downloaded = 0;
let failed = 0;

for (const [url, meta] of wanted) {
  const buffer = await fetchBuffer(url);
  if (!buffer) {
    failed++;
    console.warn(`  ! could not fetch ${url}`);
    continue;
  }

  let dims;
  try {
    dims = await sharp(buffer, { animated: false }).rotate().metadata();
  } catch {
    failed++;
    console.warn(`  ! could not decode ${url}`);
    continue;
  }
  const srcW = dims.width || 0;
  const srcH = dims.height || 0;
  if (!srcW || !srcH) {
    failed++;
    continue;
  }

  const cap = Math.min(srcW, Math.max(...WIDTHS));
  const targets = [...new Set(WIDTHS.filter((w) => w < srcW).concat(cap))]
    .filter((w) => w > 0)
    .sort((a, b) => a - b);

  const id = createHash('sha1').update(url).digest('hex').slice(0, 16);
  const ym = ymFromUrl(url);
  await mkdir(join(UPLOADS, ym), { recursive: true });

  const variants = {};
  let largest = null;
  let bytes = 0;
  for (const w of targets) {
    const out = await sharp(buffer, { animated: false })
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const rel = `/uploads/${ym}/${id}-${w}.webp`;
    await writeFile(join(UPLOADS, ym, `${id}-${w}.webp`), out);
    variants[w] = rel;
    largest = rel;
    bytes = out.length;
  }

  const nameFromUrl = decodeURIComponent(url.split('/').pop() || 'image');
  mediaByUrl.set(url, {
    localId: id,
    filename: nameFromUrl,
    path: largest,
    variants,
    mime: 'image/webp',
    width: cap,
    height: Math.round(srcH * (cap / (srcW || 1))),
    bytes,
    alt: meta.alt || '',
  });
  downloaded++;
  if (downloaded % 10 === 0) console.log(`  … ${downloaded} images`);
}

// ── build the manifest ──────────────────────────────────────────────────────
const slugify = (s) =>
  String(s)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);

const RESERVED = new Set([
  'about-us', 'contact-us', 'news', 'services', 'start-process', 'thank-you',
  'url-checker', 'phone-check', '404', 'privacy-policy', 'cookie-policy',
  'terms-and-conditions', 'data-protection-addendum', 'admin', 'api', 'uploads',
  'en', 'nl', 'fr', 'de', 'it', 'es', 'pt',
]);

// authors: dedupe by display name
const authorNames = [...new Set(Object.values(authorsByLogin))];
const manifestAuthors = authorNames.map((name) => ({ name }));

// categories: collect every category term used, map to a key_slug
const categorySet = new Map(); // key_slug -> name
for (const block of postItems) {
  for (const m of allMatches(block, /<category domain="category"[^>]*nicename="([^"]*)"[^>]*>([\s\S]*?)<\/category>/g)) {
    const key = m[1] || slugify(stripCdata(m[2]) || 'uncategorized');
    const name = stripCdata(m[2]) || key;
    if (!categorySet.has(key)) categorySet.set(key, name);
  }
}
if (categorySet.size === 0) categorySet.set('uncategorized', 'News');
const manifestCategories = [...categorySet].map(([key_slug, name], i) => ({
  key_slug,
  name,
  slug: key_slug,
  color: null,
  sort_order: i + 10,
}));

// rewrite a post body: drop Gutenberg comments, point <img> at local WebP + srcset
function rewriteBody(html) {
  let out = html.replace(/<!--\s*\/?wp:[^>]*-->/g, ''); // Gutenberg block markers
  out = out.replace(/<img\b[^>]*>/gi, (imgTag) => {
    const srcM = imgTag.match(/\bsrc="([^"]+)"/i);
    if (!srcM) return imgTag;
    let src = srcM[1];
    if (src.startsWith('/')) src = WP_HOST + src;
    const media = mediaByUrl.get(originalUrl(src));
    if (!media) return imgTag; // leave unknown images alone
    const altM = imgTag.match(/\balt="([^"]*)"/i);
    const alt = altM ? altM[1] : media.alt || '';
    const srcset = Object.entries(media.variants)
      .map(([w, p]) => `${p} ${w}w`)
      .join(', ');
    return `<img src="${media.path}" srcset="${srcset}" alt="${alt}" loading="lazy" />`;
  });
  return out.trim();
}

const usedSlugs = new Set();
function uniqueSlug(base) {
  let slug = slugify(base) || 'article';
  if (RESERVED.has(slug)) slug = `${slug}-article`;
  let candidate = slug;
  let n = 2;
  while (usedSlugs.has(candidate)) candidate = `${slug}-${n++}`;
  usedSlugs.add(candidate);
  return candidate;
}

const manifestPosts = [];
for (const block of postItems) {
  const status = firstTag(block, 'wp:status'); // 'publish', 'draft', ...
  const title = firstTag(block, 'title') || 'Untitled';
  const wpName = firstTag(block, 'wp:post_name');
  const slug = uniqueSlug(wpName || title);
  const dateGmt = firstTag(block, 'wp:post_date_gmt');
  const published_at =
    dateGmt && dateGmt !== '0000-00-00 00:00:00' ? dateGmt.replace(' ', 'T') + 'Z' : null;

  const creator = firstTag(block, 'dc:creator');
  const author = creator ? authorsByLogin[creator] || creator : null;

  const cats = allMatches(block, /<category domain="category"[^>]*nicename="([^"]*)"/g).map((m) => m[1]);
  const category_key = cats[0] || [...categorySet.keys()][0];

  const thumbId = postmeta(block, '_thumbnail_id');
  const coverUrl = thumbId && attachments[thumbId] ? attachments[thumbId].url : null;
  const cover = coverUrl ? mediaByUrl.get(coverUrl) : null;

  const rawContent = firstTag(block, 'content:encoded') ?? '';
  const body_html = rewriteBody(rawContent);
  const rawExcerpt = firstTag(block, 'excerpt:encoded') ?? '';

  // Pull the exact production SEO title + meta description from the live page.
  const link = firstTag(block, 'link');
  const { seo_title, seo_description } = await liveSeo(link);
  if (manifestPosts.length % 10 === 0) console.log(`  … SEO ${manifestPosts.length}/${postItems.length}`);

  manifestPosts.push({
    slug,
    title,
    link,
    excerpt: (rawExcerpt || '').replace(/<[^>]+>/g, '').trim() || null,
    body_html,
    author_name: author,
    category_key,
    cover_local_id: cover ? cover.localId : null,
    status: status === 'publish' ? 'published' : 'draft',
    published_at,
    seo_title,
    seo_description,
    keywords: [],
  });
}

const manifest = {
  generated_at_source: 'wordpress-export.xml',
  authors: manifestAuthors,
  categories: manifestCategories,
  media: [...mediaByUrl.values()],
  posts: manifestPosts,
};

await writeFile(join(SEED, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('\nDone.');
console.log(`  authors:    ${manifestAuthors.length}`);
console.log(`  categories: ${manifestCategories.length}`);
console.log(`  media:      ${manifest.media.length} (downloaded ${downloaded}, failed ${failed})`);
console.log(`  posts:      ${manifestPosts.length} (${manifestPosts.filter((p) => p.status === 'published').length} published)`);
