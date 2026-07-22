import { pool } from '../config/database.js';
import { sanitizeBody, readingMinutes, slugify, autoExcerpt, slugConflict } from '../services/content.js';
import { toLimit, toOffset } from '../services/pagination.js';

// The default content locale. When a post (or a whole listing) has no translation for
// the requested locale, the public queries fall back to this one so the localized URL
// still renders English rather than 404-ing / showing an empty page. The article page
// then canonicalises a fallback to its English URL, so this never creates duplicate
// content in search.
const DEFAULT_LOCALE = 'en';

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
  // Public (site)
  //
  // Every public query joins post_translations on the locale, so a post with no
  // translation for that language simply does not appear. That is deliberate:
  // falling back to English would produce duplicate content and a half-translated
  // page, which is worse than the article not being there.

  /**
   * Without this annotation TypeScript infers `categorySlug: null` from the default,
   * and the SSR page - which passes the ?category= query string - fails to typecheck.
   *
   * @param {string} locale
   * @param {{ categorySlug?: string | null, limit?: number, offset?: number }} [options]
   */
  /**
   * @param {string} locale
   * @param {{ categorySlug?: string | null, limit?: number, offset?: number, excludeId?: number | null }} [opts]
   *
   * `excludeId` exists for /news/, where the featured article headlines the page. It has
   * to be excluded from the QUERY, not filtered out of the results afterwards: filtering
   * after the fact silently shortens whichever page the featured post happens to land
   * in, so page 1 shows 14 cards and page 3 shows 15, and the offsets stop lining up.
   *
   * The `p.id DESC` tiebreaker is what makes LIMIT/OFFSET paging correct, and it is not
   * cosmetic. `published_at` is a DATETIME - second precision - so two articles published
   * in the same second, or backdated to the same day, tie. SQL leaves the order of tied
   * rows undefined, and MySQL is free to resolve the tie differently between the query
   * for OFFSET 0 and the query for OFFSET 15. It does: page 2 then repeats rows page 1
   * already showed and skips others entirely. Ordering on a column that is unique makes
   * the sort a total order, and the pages line up.
   */
  static async findPublished(
    locale,
    { categorySlug = null, limit = 24, offset = 0, excludeId = null } = {}
  ) {
    const run = async (loc) => {
      const params = [loc, loc, loc];
      if (categorySlug) params.push(categorySlug);
      if (excludeId) params.push(Number(excludeId));
      params.push(toLimit(limit, { def: 24 }), toOffset(offset));
      const [rows] = await pool.query(
        `SELECT ${PUBLIC_COLUMNS} ${PUBLIC_JOINS}
          WHERE p.status = 'published' AND p.published_at <= NOW()
            ${categorySlug ? 'AND ct.slug = ?' : ''}
            ${excludeId ? 'AND p.id <> ?' : ''}
          ORDER BY p.published_at DESC, p.id DESC
          LIMIT ? OFFSET ?`,
        params
      );
      return rows.map(hydrate);
    };
    const rows = await run(locale);
    // No posts translated for this locale -> show the English list rather than an empty
    // /nl/news/. (Category-filtered pages fall back too; the slug matches the English one.)
    if (rows.length === 0 && locale !== DEFAULT_LOCALE) return run(DEFAULT_LOCALE);
    return rows;
  }

  // `p.id DESC` for the same reason as findPublished: without a unique last sort key,
  // two articles that tie leave the winner up to MySQL, and "which article is the hero"
  // could then answer differently on two consecutive page loads.
  static async findFeatured(locale) {
    const run = async (loc) => {
      const [rows] = await pool.query(
        `SELECT ${PUBLIC_COLUMNS} ${PUBLIC_JOINS}
          WHERE p.status = 'published' AND p.published_at <= NOW()
          ORDER BY p.featured DESC, p.published_at DESC, p.id DESC
          LIMIT 1`,
        [loc, loc, loc]
      );
      return hydrate(rows[0]) ?? null;
    };
    return (await run(locale)) ?? (locale !== DEFAULT_LOCALE ? run(DEFAULT_LOCALE) : null);
  }

  /**
   * `preview` lets the admin see a draft on the real site, with the real CSS -
   * the thing a static build could never give us without rebuilding on every keystroke.
   *
   * Falls back to the default-locale translation when the requested locale has none, so
   * /nl/<english-slug>/ renders the English article instead of 404-ing. `is_fallback` is
   * set on the returned post so the page can canonicalise it to its English URL.
   */
  static async findBySlug(locale, slug, { preview = false } = {}) {
    const run = async (loc) => {
      const [rows] = await pool.query(
        `SELECT ${PUBLIC_COLUMNS}, pt.body_html, p.status, p.updated_at
           ${PUBLIC_JOINS}
          WHERE pt.slug = ?
            ${preview ? '' : "AND p.status = 'published' AND p.published_at <= NOW()"}
          LIMIT 1`,
        [loc, loc, loc, slug]
      );
      return hydrate(rows[0]) ?? null;
    };
    let post = await run(locale);
    if (!post && locale !== DEFAULT_LOCALE) {
      post = await run(DEFAULT_LOCALE);
      if (post) post.is_fallback = true;
    }
    return post;
  }

  /** Cards under an article: same category first, newest, never itself. */
  static async findRelated(locale, postId, categoryId, limit = 3) {
    const run = async (loc) => {
      const [rows] = await pool.query(
        `SELECT ${PUBLIC_COLUMNS} ${PUBLIC_JOINS}
          WHERE p.status = 'published' AND p.published_at <= NOW() AND p.id <> ?
          ORDER BY (p.category_id = ?) DESC, p.published_at DESC, p.id DESC
          LIMIT ?`,
        [loc, loc, loc, postId, categoryId ?? 0, toLimit(limit, { def: 3 })]
      );
      return rows.map(hydrate);
    };
    const rows = await run(locale);
    if (rows.length === 0 && locale !== DEFAULT_LOCALE) return run(DEFAULT_LOCALE);
    return rows;
  }

  /** Every published (post, locale) pair - the sitemap needs all of them. */
  static async allPublishedSlugs() {
    const [rows] = await pool.query(
      `SELECT pt.locale, pt.slug, p.updated_at
         FROM posts p
         JOIN post_translations pt ON pt.post_id = p.id
        WHERE p.status = 'published' AND p.published_at <= NOW()`
    );
    return rows;
  }

  /**
   * Every locale this post is translated into, mapped to its slug. The language switcher
   * and hreflang need it: the slug is translated too, so the same article lives at a
   * different path in each language (/how-to-spot.../ vs /nl/hoe-herken.../), and a naive
   * prefix swap would 404.
   *
   * @param {number} postId
   * @returns {Promise<Record<string, string>>}
   */
  static async localeSlugs(postId) {
    const [rows] = await pool.execute(
      'SELECT locale, slug FROM post_translations WHERE post_id = ?',
      [postId]
    );
    return Object.fromEntries(rows.map((r) => [r.locale, r.slug]));
  }

  // Admin

  /**
   * @returns {Promise<{ rows: object[], total: number }>} one page of posts plus the
   * full count matching the filter, so the admin can render page controls. `total` is
   * counted with the same WHERE but no LIMIT - the count of matching POSTS, which is the
   * number of GROUP BY groups, so no join or DISTINCT is needed on the posts table.
   */
  static async listAdmin({ status = null, q = null, limit = 25, offset = 0 } = {}) {
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
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

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
        ${clause}
        GROUP BY p.id, p.status, p.featured, p.published_at, p.updated_at,
                 c.key_slug, a.name, m.path
        ORDER BY p.updated_at DESC
        LIMIT ? OFFSET ?`,
      [...params, toLimit(limit), toOffset(offset)]
    );

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM posts p ${clause}`, params);

    return {
      total,
      rows: rows.map((r) => ({
        ...r,
        // JSON_ARRAYAGG over a LEFT JOIN with no matches gives [null], not [].
        locales: (parseJson(r.locales) ?? []).filter(Boolean),
        // A post whose only translation isn't English still needs a label in the list.
        title: r.title ?? '(untitled)',
      })),
    };
  }

  /** The full record, with every translation - what the editor loads. */
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
    // Slug the whole set first, and refuse a reserved one BEFORE a transaction is open -
    // there is nothing to roll back, and the editor gets the error on the field it
    // belongs to rather than a 500 from the middle of a write.
    const slugs = Object.fromEntries(
      Object.entries(translations).map(([locale, t]) => [locale, slugify(t.slug || t.title)])
    );
    const multi = Object.keys(slugs).length > 1;
    const conflicts = Object.entries(slugs)
      .map(([locale, slug]) => {
        const why = slugConflict(slug);
        return why && { field: 'slug', message: multi ? `${locale}: ${why}` : why };
      })
      .filter(Boolean);

    if (conflicts.length > 0) {
      const err = new Error(conflicts[0].message);
      err.status = 400;
      err.errors = conflicts;
      throw err;
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // published_at is stamped by MYSQL - never by `new Date()` in JavaScript.
      //
      // mysql2 sends a JS Date with its millisecond part, and MySQL ROUNDS that into a
      // DATETIME(0): 13:09:40.812 is stored as 13:09:41 - one second in the FUTURE.
      // The article then fails the `published_at <= NOW()` filter for that second, so
      // it 404s... and the 404 is what gets cached, for five minutes. An editor clicks
      // Publish, opens the article, sees "Page not found", and keeps seeing it. Any
      // publish landing on .500ms or later - about half of them.
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

      // Only one post may be featured - the listing has exactly one hero card.
      if (featured) {
        await conn.execute('UPDATE posts SET featured = 0 WHERE id <> ?', [postId]);
      }

      for (const [locale, t] of Object.entries(translations)) {
        const body = sanitizeBody(t.body_html);
        const slug = slugs[locale];
        // An excerpt nobody wrote is better than an empty card - as long as it reads
        // like one. autoExcerpt skips the Q&A block and cuts on a word boundary.
        const excerpt = t.excerpt?.trim() || autoExcerpt(body);

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
        // error - MySQL would quietly UPDATE that OTHER post's row instead. The
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
    // NOW(), not a JS Date - see the comment in save(). A first publish stamps the
    // date; re-publishing something that was already dated keeps its original date.
    //
    // The `published` case is a SEPARATE statement rather than one
    // `IF(? = 'published' …)` expression, because MariaDB's prepared-statement protocol
    // rejects a parameter marker used as an operand inside IF() there (it 500s with an
    // opaque error). Here no placeholder sits inside the conditional, so it prepares
    // cleanly on both MariaDB and MySQL. `status` is enum-validated, so the literal is safe.
    if (status === 'published') {
      await pool.execute(
        `UPDATE posts
            SET status = 'published',
                published_at = IF(published_at IS NULL, NOW(), published_at)
          WHERE id = ?`,
        [id]
      );
    } else {
      await pool.execute('UPDATE posts SET status = ? WHERE id = ?', [status, id]);
    }
  }

  static async remove(id) {
    await pool.execute('DELETE FROM posts WHERE id = ?', [id]); // translations cascade
  }
}
