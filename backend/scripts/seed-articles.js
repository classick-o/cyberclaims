// Seeds the WordPress import into the database. Runs ON THE SERVER (it needs the DB and
// writes into UPLOAD_DIR):
//
//   node backend/scripts/seed-articles.js
//
// It reads seed/manifest.json + seed/media/** (both produced by prepare-articles.mjs
// while the old wordpress site was still online) and:
//   1. copies every WebP variant into UPLOAD_DIR, preserving the /uploads/<yyyy>/<mm>/…
//      layout the manifest paths already use,
//   2. inserts authors, categories, media and posts.
//
// Idempotent: if the first article's slug already exists, it assumes the seed has run
// and exits without touching anything.

import { readFile, mkdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
// Load .env by absolute path — Passenger/cron cwd isn't guaranteed to be the app root.
dotenv.config({ path: join(ROOT, '.env') });

const { env } = await import('../src/config/env.js');
const { pool } = await import('../src/config/database.js');
const { Media } = await import('../src/models/Media.js');
const { Author, Category } = await import('../src/models/Taxonomy.js');
const { Post } = await import('../src/models/Post.js');

const SEED = join(HERE, 'seed');
const manifest = JSON.parse(await readFile(join(SEED, 'manifest.json'), 'utf8'));

// ── idempotency guard ───────────────────────────────────────────────────────
const firstSlug = manifest.posts[0]?.slug;
if (firstSlug) {
  const [[hit]] = await pool.query(
    'SELECT 1 FROM post_translations WHERE slug = ? LIMIT 1',
    [firstSlug]
  );
  if (hit) {
    console.log(`Already seeded (slug "${firstSlug}" exists). Nothing to do.`);
    await pool.end();
    process.exit(0);
  }
}

// ── 1. copy WebP into UPLOAD_DIR ────────────────────────────────────────────
// Manifest paths look like /uploads/2024/10/<id>-<w>.webp; the local source lives at
// seed/media/2024/10/<id>-<w>.webp and the target at <UPLOAD_DIR>/2024/10/<id>-<w>.webp.
let copied = 0;
for (const m of manifest.media) {
  for (const rel of Object.values(m.variants)) {
    const sub = String(rel).replace(/^\/uploads\//, ''); // 2024/10/<id>-<w>.webp
    const src = join(SEED, 'media', sub);
    const dest = join(env.UPLOAD_DIR, sub);
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(src, dest);
    copied++;
  }
}
console.log(`Copied ${copied} image files into ${env.UPLOAD_DIR}`);

// ── 2. authors ──────────────────────────────────────────────────────────────
const authorId = {};
for (const a of manifest.authors) {
  const [[existing]] = await pool.query('SELECT id FROM authors WHERE name = ? LIMIT 1', [a.name]);
  authorId[a.name] = existing ? existing.id : await Author.create({ name: a.name });
}
console.log(`Authors: ${Object.keys(authorId).length}`);

// ── 3. categories ───────────────────────────────────────────────────────────
const categoryId = {};
for (const c of manifest.categories) {
  const [[existing]] = await pool.query('SELECT id FROM categories WHERE key_slug = ? LIMIT 1', [c.key_slug]);
  if (existing) {
    categoryId[c.key_slug] = existing.id;
  } else {
    categoryId[c.key_slug] = await Category.create({
      key_slug: c.key_slug,
      color: c.color,
      sort_order: c.sort_order,
      translations: { en: { name: c.name, slug: c.slug } },
    });
  }
}
console.log(`Categories: ${Object.keys(categoryId).length}`);

// ── 4. media rows ───────────────────────────────────────────────────────────
const mediaId = {};
for (const m of manifest.media) {
  mediaId[m.localId] = await Media.create({
    filename: m.filename,
    path: m.path,
    variants: m.variants,
    mime: m.mime,
    width: m.width,
    height: m.height,
    bytes: m.bytes,
    alt: m.alt || undefined,
    locale: 'en',
  });
}
console.log(`Media: ${Object.keys(mediaId).length}`);

// ── 5. posts ────────────────────────────────────────────────────────────────
let inserted = 0;
for (const p of manifest.posts) {
  try {
    await Post.save({
      category_id: p.category_key ? categoryId[p.category_key] ?? null : null,
      author_id: p.author_name ? authorId[p.author_name] ?? null : null,
      cover_media_id: p.cover_local_id ? mediaId[p.cover_local_id] ?? null : null,
      featured: false,
      status: p.status,
      published_at: p.published_at, // preserves the original WP date
      translations: {
        en: {
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt ?? '',
          body_html: p.body_html, // Post.save sanitises this
          seo_title: p.seo_title,
          seo_description: p.seo_description,
          keywords: p.keywords ?? [],
        },
      },
    });
    inserted++;
  } catch (err) {
    console.error(`  ! post "${p.slug}" failed: ${err.message}`);
  }
}
console.log(`Posts inserted: ${inserted}/${manifest.posts.length}`);

await pool.end();
console.log('\nSeed complete.');
