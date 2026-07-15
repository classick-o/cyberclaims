// Applies the per-article SEO (title + meta description, captured from the live
// cyberclaims.net pages by prepare-articles.mjs) onto the already-seeded posts.
//
//   node backend/scripts/update-article-seo.js
//
// Safe to re-run: it's a plain UPDATE keyed on the slug. Unlike seed-articles.js it does
// NOT guard on "already seeded" — its whole job is to update existing rows.

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const HERE = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(HERE, '..', '..', '.env') });

await import('../src/config/env.js');
const { pool } = await import('../src/config/database.js');

const manifest = JSON.parse(await readFile(join(HERE, 'seed', 'manifest.json'), 'utf8'));

let updated = 0;
let missing = 0;
for (const p of manifest.posts) {
  if (!p.seo_title && !p.seo_description) continue;
  const [res] = await pool.execute(
    `UPDATE post_translations
        SET seo_title = ?, seo_description = ?
      WHERE slug = ? AND locale = 'en'`,
    [p.seo_title ?? null, p.seo_description ?? null, p.slug]
  );
  if (res.affectedRows > 0) updated++;
  else missing++;
}

console.log(`SEO updated: ${updated} post(s); ${missing} slug(s) not found.`);
await pool.end();
