import { pool } from '../config/database.js';
import { sanitizeBody, readingMinutes, slugify, toPlainText } from '../services/content.js';

const parseJson = (v) => {
  if (v == null) return null;
  if (typeof v === 'object') return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

// Everything the site needs to render a card or an article, in one row.
const PUBLIC_COLUMNS = `
  p.id, p.featured, p.published_at,
  pt.locale, pt.slug, pt.title, pt.excerpt, pt.reading_minutes,
  pt.seo_title, pt.seo_description, pt.keywords,
  c.key_slug AS category_key, c.color AS category_color,
  COALESCE(ct.name, c.key_slug) AS category_name,
  COALESCE(ct.slug, c.key_slug) AS category_slug,
  a.name AS author_name, a.role AS author_role,
  m.path AS cover_path, m.variants AS cover_variants, m.width AS cover_width, m.height AS cover_height,
  mt.alt AS cover_alt`;

const PUBLIC_JOINS = `
  FROM posts p
  JOIN post_translations pt ON pt.post_id = p.id AND pt.locale = ?
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = ?
  LEFT JOIN authors a ON a.id = p.author_id
  LEFT JOIN media m ON m.id = p.cover_media_id
  LEFT JOIN media_translations mt ON mt.media_id = m.id AND mt.locale = ?`;

const hydrate = (row) =>
  row && {
    ...row,
    keywords: parseJson(row.keywords) ?? [],
    cover_variants: parseJson(row.cover_variants),
  };

export class Post {
  // ─── Public (site) ─────────────────────────────────────────────────────────
  //
  // Every public query joins post_translations on the locale, so a post with no
  // translation for that language simply does not appear. That is deliberate:
  // falling back to English would produce duplicate content and a half-translated
  // page, which is worse than the article not being there.

  static async findPublished(locale, { categorySlug = null, limit = 24, offset = 0 } = {}) {
    const [rows] = await pool.query(
      `SELECT ${PUBLIC_COLUMNS} ${PUBLIC_JOINS}
        WHERE p.status = 'published' AND p.published_at <= NOW()
          ${categorySlug ? 'AND ct.slug = ?' : ''}
        ORDER BY p.published_at DESC
        LIMIT ? OFFSET ?`,
      categorySlug
        ? [locale, locale, locale, categorySlug, Number(limit), Number(offset)]
        : [locale, locale, locale, Number(limit), Number(offset)]
    );
    return rows.map(hydrate);
  }

  static async findFeatured(locale) {
    const [rows] = await pool.query(
      `SELECT ${PUBLIC_COLUMNS} ${PUBLIC_JOINS}
        WHERE p.status = 'published' AND p.published_at <= NOW()
        ORDER BY p.featured DESC, p.published_at DESC
        LIMIT 1`,
      [locale, locale, locale]
    );
    return hydrate(rows[0]) ?? null;
  }

  /**
   * `preview` lets the admin see a draft on the real site, with the real CSS —
   * the thing a static build could never give us without rebuilding on every keystroke.
   */
  static async findBySlug(locale, slug, { preview = false } = {}) {
    const [rows] = await pool.query(
      `SELECT ${PUBLIC_COLUMNS}, pt.body_html, p.status, p.updated_at
         ${PUBLIC_JOINS}
        WHERE pt.slug = ?
          ${preview ? '' : "AND p.status = 'published' AND p.published_at <= NOW()"}
        LIMIT 1`,
      [locale, locale, locale, slug]
    );
    return hydrate(rows[0]) ?? null;
  }

  /** Cards under an article: same category first, newest, never itself. */
  static async findRelated(locale, postId, categoryId, limit = 3) {
    const [rows] = await pool.query(
      `SELECT ${PUBLIC_COLUMNS} ${PUBLIC_JOINS}
        WHERE p.status = 'published' AND p.published_at <= NOW() AND p.id <> ?
        ORDER BY (p.category_id = ?) DESC, p.published_at DESC
        LIMIT ?`,
      [locale, locale, locale, postId, categoryId ?? 0, Number(limit)]
    );
    return rows.map(hydrate);
  }

  /** Every published (post, locale) pair — the sitemap needs all of them. */
  static async allPublishedSlugs() {
    const [rows] = await pool.query(
      `SELECT pt.locale, pt.slug, p.updated_at
         FROM posts p
         JOIN post_translations pt ON pt.post_id = p.id
        WHERE p.status = 'published' AND p.published_at <= NOW()`
    );
    return rows;
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  static async listAdmin({ status = null, q = null, limit = 50, offset = 0 } = {}) {
    const where = [];
    const params = [];
    if (status) {
      where.push('p.status = ?');
      params.push(status);
    }
    if (q) {
      where.push('EXISTS (SELECT 1 FROM post_translations x WHERE x.post_id = p.id AND x.title LIKE ?)');
      params.push(`%${q}%`);
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.status, p.featured, p.published_at, p.updated_at,
              c.key_slug AS category_key,
              a.name AS author_name,
              m.path AS cover_path,
              JSON_ARRAYAGG(pt.locale) AS locales,
              MAX(CASE WHEN pt.locale = 'en' THEN pt.title END) AS title
         FROM posts p
         LEFT JOIN post_translations pt ON pt.post_id = p.id
         LEFT JOIN categories c ON c.id = p.category_id
         LEFT JOIN authors a ON a.id = p.author_id
         LEFT JOIN media m ON m.id = p.cover_media_id
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        GROUP BY p.id, p.status, p.featured, p.published_at, p.updated_at,
                 c.key_slug, a.name, m.path
        ORDER BY p.updated_at DESC
        LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    return rows.map((r) => ({
      ...r,
      // JSON_ARRAYAGG over a LEFT JOIN with no matches gives [null], not [].
      locales: (parseJson(r.locales) ?? []).filter(Boolean),
      // A post whose only translation isn't English still needs a label in the list.
      title: r.title ?? '(untitled)',
    }));
  }

  /** The full record, with every translation — what the editor loads. */
  static async findByIdAdmin(id) {
    const [posts] = await pool.execute('SELECT * FROM posts WHERE id = ? LIMIT 1', [id]);
    if (!posts[0]) return null;

    const [translations] = await pool.execute(
      'SELECT * FROM post_translations WHERE post_id = ?',
      [id]
    );

    return {
      ...posts[0],
      translations: Object.fromEntries(
        translations.map((t) => [t.locale, { ...t, keywords: parseJson(t.keywords) ?? [] }])
      ),
    };
  }

  static async save({ id = null, category_id, author_id, cover_media_id, featured, status, published_at, translations }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // published_at is stamped by MYSQL — never by `new Date()` in JavaScript.
      //
      // mysql2 sends a JS Date with its millisecond part, and MySQL ROUNDS that into a
      // DATETIME(0): 13:09:40.812 is stored as 13:09:41 — one second in the FUTURE.
      // The article then fails the `published_at <= NOW()` filter for that second, so
      // it 404s... and the 404 is what gets cached, for five minutes. An editor clicks
      // Publish, opens the article, sees "Page not found", and keeps seeing it. Any
      // publish landing on .500ms or later — about half of them.
      //
      // NOW() also removes the whole class of JS-vs-MySQL clock-skew bugs, since only
      // one clock is ever consulted.
      //
      // An explicit published_at (a scheduled publication) is still honoured; only the
      // implicit "now" comes from the database.
      const publishing = status === 'published';
      const scheduled = publishing && published_at ? new Date(published_at) : null;
      const stamp = publishing ? (scheduled ? '?' : 'NOW()') : 'NULL';
      const stampArgs = scheduled ? [scheduled] : [];

      let postId = id;
      if (postId) {
        await conn.execute(
          `UPDATE posts SET category_id = ?, author_id = ?, cover_media_id = ?,
                            featured = ?, status = ?, published_at = ${stamp}
            WHERE id = ?`,
          [category_id ?? null, author_id ?? null, cover_media_id ?? null,
           featured ? 1 : 0, status, ...stampArgs, postId]
        );
      } else {
        const [result] = await conn.execute(
          `INSERT INTO posts (category_id, author_id, cover_media_id, featured, status, published_at)
           VALUES (?, ?, ?, ?, ?, ${stamp})`,
          [category_id ?? null, author_id ?? null, cover_media_id ?? null,
           featured ? 1 : 0, status, ...stampArgs]
        );
        postId = result.insertId;
      }

      // Only one post may be featured — the listing has exactly one hero card.
      if (featured) {
        await conn.execute('UPDATE posts SET featured = 0 WHERE id <> ?', [postId]);
      }

      for (const [locale, t] of Object.entries(translations)) {
        const body = sanitizeBody(t.body_html);
        const slug = slugify(t.slug || t.title);
        // An excerpt nobody wrote is better than an empty card.
        const excerpt = t.excerpt?.trim() || toPlainText(body).slice(0, 200);

        const fields = [
          slug, t.title, excerpt, body,
          t.seo_title ?? null, t.seo_description ?? null,
          JSON.stringify(t.keywords ?? []), readingMinutes(body),
        ];

        // Explicit SELECT-then-UPDATE/INSERT, NOT `INSERT ... ON DUPLICATE KEY UPDATE`.
        //
        // post_translations carries two unique keys: uq_post_locale (post_id, locale)
        // and uq_locale_slug (locale, slug). ON DUPLICATE KEY fires on EITHER of them,
        // so a new post whose title slugs to an existing article's slug would not
        // error — MySQL would quietly UPDATE that OTHER post's row instead. The
        // published article silently loses its body, and the new post is left with no
        // translation at all. (Watched it happen; see the fix's test.)
        //
        // Keyed on (post_id, locale) explicitly, a slug collision now raises
        // ER_DUP_ENTRY, which asUserError() turns into "that URL slug is taken".
        const [existing] = await conn.execute(
          'SELECT id FROM post_translations WHERE post_id = ? AND locale = ? LIMIT 1',
          [postId, locale]
        );

        if (existing[0]) {
          await conn.execute(
            `UPDATE post_translations
                SET slug = ?, title = ?, excerpt = ?, body_html = ?,
                    seo_title = ?, seo_description = ?, keywords = ?, reading_minutes = ?
              WHERE id = ?`,
            [...fields, existing[0].id]
          );
        } else {
          await conn.execute(
            `INSERT INTO post_translations
               (slug, title, excerpt, body_html, seo_title, seo_description, keywords, reading_minutes, post_id, locale)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [...fields, postId, locale]
          );
        }
      }

      await conn.commit();
      return postId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /** Publish / unpublish / archive from the list view, without loading the whole post. */
  static async setStatus(id, status) {
    // NOW(), not a JS Date — see the comment in save(). A first publish stamps the
    // date; re-publishing something that was already dated keeps its original date.
    await pool.execute(
      `UPDATE posts
          SET status = ?,
              published_at = IF(? = 'published' AND published_at IS NULL, NOW(), published_at)
        WHERE id = ?`,
      [status, status, id]
    );
  }

  static async remove(id) {
    await pool.execute('DELETE FROM posts WHERE id = ?', [id]); // translations cascade
  }
}
