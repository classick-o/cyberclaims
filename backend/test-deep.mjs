// Deeper QA: concurrency, publish-time correctness, draft visibility, multi-locale
// slugs, multipart CSRF, on-disk cleanup, CSV escaping, SSR param robustness.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pool } from './src/config/database.js';
import { Post } from './src/models/Post.js';
import { toCsv } from './src/services/csv.js';
import { env } from './src/config/env.js';

const BASE = 'http://localhost:3000';
const ADMIN = { email: 'qa-admin@cyberclaims.net', password: 'QaTest!2026x' };

let pass = 0, fail = 0; const fails = []; const findings = [];
const ok = (n, c, d = '') => { if (c) { pass++; process.stdout.write('.'); } else { fail++; fails.push(`${n}${d ? ' — ' + d : ''}`); process.stdout.write('F'); } };
const finding = (s, w) => findings.push(`[${s}] ${w}`);

function jarStr(j) { return Object.entries(j).map(([k, v]) => `${k}=${v}`).join('; '); }
async function login() {
  const r = await fetch(BASE + '/api/admin/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ADMIN) });
  const jar = {};
  for (const c of r.headers.getSetCookie()) { const [p] = c.split(';'); const i = p.indexOf('='); jar[p.slice(0, i).trim()] = p.slice(i + 1).trim(); }
  return jar;
}
async function api(method, path, body, jar) {
  const h = { Cookie: jarStr(jar) };
  if (method !== 'GET') h['x-csrf-token'] = jar.cc_csrf;
  if (body !== undefined) h['Content-Type'] = 'application/json';
  const r = await fetch(BASE + path, { method, headers: h, body: body !== undefined ? JSON.stringify(body) : undefined, redirect: 'manual' });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, json: j, text: t };
}
const mk = (slug, over = {}) => ({ status: 'draft', featured: false, category_id: null, author_id: null, cover_media_id: null, translations: { en: { title: `Deep ${slug}`, body_html: '<p>body</p>', slug, ...over } } });
const clean = [];

(async () => {
  const jar = await login();

  // ── CSV injection escaping (unit-level, the real security control) ──────────
  console.log('\n── CSV ESCAPING ──');
  const csv = toCsv([{ a: '=cmd|calc', b: '+1+1', c: '-2', d: '@SUM', e: 'normal', f: 'has "quote"' }], ['a', 'b', 'c', 'd', 'e', 'f']);
  ok('formula = neutralised', csv.includes(`"'=cmd|calc"`), csv.split('\r\n')[1]);
  ok('formula + neutralised', csv.includes(`"'+1+1"`));
  ok('formula - neutralised', csv.includes(`"'-2"`));
  ok('formula @ neutralised', csv.includes(`"'@SUM"`));
  ok('normal cell not touched', csv.includes('"normal"'));
  ok('quotes doubled', csv.includes('"has ""quote"""'));

  // ── publish-time correctness (the historical NOW()-rounds-up bug) ───────────
  console.log('\n── PUBLISH TIMING ──');
  const pub = await api('POST', '/api/admin/posts', mk('deep-immediate', { title: 'Deep immediate publish' }), jar);
  if (pub.json?.id) clean.push(pub.json.id);
  await api('POST', `/api/admin/posts/${pub.json.id}/status`, { status: 'published' }, jar);
  // published_at must be <= NOW(), so the post is visible the instant it is published
  const [[row]] = await pool.query('SELECT published_at, published_at <= NOW() AS visible FROM posts WHERE id = ?', [pub.json.id]);
  ok('published_at is not in the future', row.visible === 1, `published_at=${row.published_at}`);
  const found = await Post.findBySlug('en', 'deep-immediate');
  ok('published post is immediately queryable', !!found && found.status === 'published');

  // scheduled (future) publish must NOT be visible yet
  const [ins] = await pool.query("INSERT INTO posts (status, published_at) VALUES ('published', DATE_ADD(NOW(), INTERVAL 1 DAY))");
  clean.push(ins.insertId);
  await pool.query("INSERT INTO post_translations (post_id, locale, slug, title, body_html) VALUES (?, 'en', 'deep-future', 'Deep future', '<p>x</p>')", [ins.insertId]);
  const future = await Post.findBySlug('en', 'deep-future');
  ok('future-dated publish is NOT publicly visible', future === null);
  if (future !== null) finding('HIGH', 'A post with a future published_at is served publicly before its date');

  // ── featured exclusivity under concurrency ──────────────────────────────────
  console.log('\n── FEATURED RACE ──');
  const ids = [];
  for (const s of ['deep-feat-1', 'deep-feat-2', 'deep-feat-3']) {
    const r = await api('POST', '/api/admin/posts', mk(s), jar);
    ids.push(r.json.id); clean.push(r.json.id);
  }
  // fire three "make me featured" writes at once
  await Promise.all(ids.map((id, i) =>
    api('PUT', `/api/admin/posts/${id}`, { ...mk(`deep-feat-${i + 1}`), featured: true, status: 'published' }, jar)
  ));
  const [[{ n }]] = await pool.query('SELECT COUNT(*) n FROM posts WHERE featured = 1');
  ok('at most one featured post after concurrent writes', n <= 1, `found ${n} featured`);
  if (n > 1) finding('MEDIUM', `Concurrent featured writes left ${n} posts featured — the "only one hero" invariant races`);

  // ── slug collision race ─────────────────────────────────────────────────────
  console.log('\n── SLUG RACE ──');
  const race = await Promise.all([0, 1, 2].map((i) =>
    api('POST', '/api/admin/posts', mk('deep-samerace', { title: `Deep race ${i}` }), jar)
  ));
  race.forEach((r) => { if (r.json?.id) clean.push(r.json.id); });
  const wins = race.filter((r) => r.status === 201).length;
  const [[{ c }]] = await pool.query("SELECT COUNT(*) c FROM post_translations WHERE slug = 'deep-samerace'");
  ok('concurrent identical slugs: exactly one row exists', c === 1, `found ${c} rows with that slug`);
  ok('the losers got a 4xx, not a 500', race.filter((r) => r.status >= 500).length === 0, `statuses ${race.map((r) => r.status)}`);
  if (c > 1) finding('HIGH', 'Two posts share one slug — the SELECT-then-INSERT slug guard races past the unique key');

  // ── multi-locale reserved slug ──────────────────────────────────────────────
  console.log('\n── MULTI-LOCALE RESERVED SLUG ──');
  const ml = await api('POST', '/api/admin/posts', {
    status: 'draft', featured: false,
    translations: { en: { title: 'Fine english title', body_html: '<p>x</p>', slug: 'deep-fine-en' }, nl: { title: 'Reserved dutch', body_html: '<p>x</p>', slug: 'about-us' } },
  }, jar);
  ok('reserved slug in a SECOND locale → 400', ml.status === 400, `got ${ml.status}`);
  ok('the error names the offending locale', /nl/.test(JSON.stringify(ml.json?.errors ?? '')), JSON.stringify(ml.json));
  if (ml.json?.id) clean.push(ml.json.id);

  // ── draft visibility on the public SSR route ────────────────────────────────
  console.log('\n── DRAFT VISIBILITY ──');
  const draft = await api('POST', '/api/admin/posts', mk('deep-draft-secret', { title: 'Deep draft secret' }), jar);
  if (draft.json?.id) clean.push(draft.json.id);
  const anon = await fetch(BASE + '/deep-draft-secret/');
  ok('draft 404s for the public', anon.status === 404, `got ${anon.status}`);
  const anonPreview = await fetch(BASE + '/deep-draft-secret/?preview=1');
  ok('draft 404s even with ?preview=1 but no admin cookie', anonPreview.status === 404, `got ${anonPreview.status}`);
  const withCookie = await fetch(BASE + '/deep-draft-secret/?preview=1', { headers: { Cookie: jarStr(jar) } });
  ok('editor sees the draft via ?preview=1', withCookie.status === 200, `got ${withCookie.status}`);
  const draftBody = await withCookie.text();
  ok('draft preview is marked noindex', /noindex/i.test(draftBody), 'no noindex meta on the draft');

  // ── JSON-LD must not let admin fields break out of the <script> block ───────
  console.log('\n── JSON-LD XSS ──');
  const payload = '</scr' + 'ipt><script>window.__pwn__=1</scr' + 'ipt>';
  const xssPost = await api('POST', '/api/admin/posts', {
    status: 'published', featured: false,
    translations: { en: { title: `JSONLD probe ${payload}`, body_html: '<p>ok</p>', slug: 'deep-jsonld', seo_description: `desc ${payload} end` } },
  }, jar);
  if (xssPost.json?.id) clean.push(xssPost.json.id);
  const rendered = await (await fetch(BASE + '/deep-jsonld/')).text();
  const ld = rendered.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  // THE authoritative check: the one place admin fields are injected via set:html is the
  // ld+json block, and it must contain no raw </script> to close it early.
  ok('ld+json block has no raw </script>', ld && !/<\/script>/i.test(ld[1]), ld ? 'breakout present' : 'no block found');
  // Defence in depth: blank out every double-quoted attribute value (where the payload
  // sits inertly as text), then assert no raw <script> element carries the payload. This
  // is what a DOM parser would conclude — the naive substring match cannot tell a
  // <script> inside content="…" from a real one.
  const noAttrs = rendered.replace(/"[^"]*"/g, '""');
  ok('payload is not a live <script> element', !/<script[^>]*>[^<]*__pwn__/i.test(noAttrs));
  // and the visible <title> is HTML-escaped, not raw
  ok('title escapes the payload', /<title>[^<]*&lt;\/script&gt;/i.test(rendered));
  // and the structured data is still valid JSON that decodes back to the real title
  ok('ld+json still parses to the original data', (() => {
    try { const j = JSON.parse(ld[1]); const g = j['@graph'] ?? [j]; return JSON.stringify(g).includes(payload); }
    catch { return false; }
  })(), 'ld+json no longer parses or lost the data');

  // ── multipart upload requires CSRF (SameSite=Lax does not cover it) ──────────
  console.log('\n── UPLOAD CSRF ──');
  const img = new Uint8Array(readFileSync(new URL('../public/logo-mark.webp', import.meta.url)));
  const fd = new FormData();
  fd.append('file', new Blob([img], { type: 'image/webp' }), 'x.webp');
  const noCsrfUpload = await fetch(BASE + '/api/admin/media', { method: 'POST', headers: { Cookie: `cc_session=${jar.cc_session}` }, body: fd });
  ok('upload without CSRF token → 403', noCsrfUpload.status === 403, `got ${noCsrfUpload.status}`);

  // ── media delete unlinks the files on disk ──────────────────────────────────
  console.log('\n── MEDIA DISK CLEANUP ──');
  const fd2 = new FormData();
  fd2.append('file', new Blob([img], { type: 'image/webp' }), 'todelete.webp');
  const up = await fetch(BASE + '/api/admin/media', { method: 'POST', headers: { Cookie: jarStr(jar), 'x-csrf-token': jar.cc_csrf }, body: fd2 });
  const upJson = await up.json();
  const rel = Object.values(upJson.media.variants)[0];
  const abs = join(env.UPLOAD_DIR, rel.replace(/^\/uploads\//, ''));
  ok('uploaded file exists on disk', existsSync(abs), abs);
  await api('DELETE', `/api/admin/media/${upJson.media.id}`, undefined, jar);
  ok('deleted media file is gone from disk', !existsSync(abs), abs);
  if (existsSync(abs)) finding('LOW', 'Deleting media leaves the re-encoded files orphaned on disk');

  // ── admin pagination: stable total, correct slices, no overlap ──────────────
  console.log('\n── ADMIN PAGINATION ──');
  const [[{ base }]] = await pool.query("SELECT COUNT(*) base FROM posts");
  const seeded = [];
  for (let i = 0; i < 30; i++) {
    const [r] = await pool.query("INSERT INTO posts (status) VALUES ('draft')");
    seeded.push(r.insertId); clean.push(r.insertId);
    await pool.query("INSERT INTO post_translations (post_id, locale, slug, title, body_html) VALUES (?, 'en', ?, ?, '<p>x</p>')",
      [r.insertId, `deep-pg-${i}`, `Deep pagination ${String(i).padStart(2, '0')}`]);
  }
  const p1 = await api('GET', '/api/admin/posts?limit=25&offset=0', undefined, jar);
  const p2 = await api('GET', '/api/admin/posts?limit=25&offset=25', undefined, jar);
  ok('page 1 reports the full total', p1.json.total === base + 30, `total=${p1.json.total} expected ${base + 30}`);
  ok('total is identical across pages', p1.json.total === p2.json.total);
  ok('page 1 returns exactly 25', p1.json.posts.length === 25, `got ${p1.json.posts.length}`);
  ok('page 2 returns the remainder', p2.json.posts.length === (base + 30) - 25, `got ${p2.json.posts.length}`);
  const ids1 = new Set(p1.json.posts.map((p) => p.id));
  ok('pages do not overlap', p2.json.posts.every((p) => !ids1.has(p.id)));
  ok('every post appears exactly once across both pages',
     new Set([...p1.json.posts, ...p2.json.posts].map((p) => p.id)).size === base + 30);
  // the same filter narrows the total, not just the page
  const filtered = await api('GET', '/api/admin/posts?status=draft&limit=25&offset=0', undefined, jar);
  ok('filtered total counts only matches', filtered.json.total >= 30 && filtered.json.total <= base + 30, `draft total=${filtered.json.total}`);
  // media + leads also carry a total
  ok('media list carries a total', typeof (await api('GET', '/api/admin/media?limit=50', undefined, jar)).json.total === 'number');
  ok('leads list carries a total', typeof (await api('GET', '/api/admin/leads?limit=50', undefined, jar)).json.total === 'number');

  // ── SSR pagination param robustness ─────────────────────────────────────────
  console.log('\n── SSR PARAM ROBUSTNESS ──');
  for (const qs of ['?page=abc', '?page=-5', '?page=999999', '?category=%27%20OR%201=1', '?page=1e9']) {
    const r = await fetch(BASE + `/news/${qs}`);
    ok(`/news/${qs} → 200`, r.status === 200, `got ${r.status}`);
    if (r.status >= 500) finding('MEDIUM', `/news/${qs} returns ${r.status}`);
  }

  // ── cleanup ─────────────────────────────────────────────────────────────────
  for (const id of clean) await pool.query('DELETE FROM posts WHERE id = ?', [id]);
  await pool.end();

  console.log(`\n\n══════════════════════════════════════════`);
  console.log(`  DEEP: ${pass} passed, ${fail} failed`);
  if (fails.length) { console.log('\n  FAILURES:'); fails.forEach((f) => console.log('    ✗ ' + f)); }
  if (findings.length) { console.log('\n  FINDINGS:'); [...new Set(findings)].forEach((f) => console.log('    • ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('\nCRASH:', e); process.exit(2); });
