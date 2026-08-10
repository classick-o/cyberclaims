import { pool } from '../config/database.js';

export class Category {
  /** Public + admin listing for one locale. Falls back to key_slug if untranslated. */
  static async list(locale = 'en') {
    const [rows] = await pool.execute(
      `SELECT c.id, c.key_slug, c.color, c.sort_order,
              COALESCE(t.name, c.key_slug) AS name,
              COALESCE(t.slug, c.key_slug) AS slug
         FROM categories c
         LEFT JOIN category_translations t ON t.category_id = c.id AND t.locale = ?
        ORDER BY c.sort_order, name`,
      [locale]
    );
    return rows;
  }

  /** Only categories that actually have published posts - an empty filter tab is noise. */
  static async listWithPosts(locale = 'en') {
    const [rows] = await pool.execute(
      `SELECT c.id, c.key_slug, c.color,
              COALESCE(t.name, c.key_slug) AS name,
              COALESCE(t.slug, c.key_slug) AS slug,
              COUNT(p.id) AS post_count
         FROM categories c
         LEFT JOIN category_translations t ON t.category_id = c.id AND t.locale = ?
         JOIN posts p ON p.category_id = c.id AND p.status = 'published'
         JOIN post_translations pt ON pt.post_id = p.id AND pt.locale = ?
        GROUP BY c.id, c.key_slug, c.color, t.name, t.slug, c.sort_order
        ORDER BY c.sort_order, name`,
      [locale, locale]
    );
    return rows;
  }

  static async create({ key_slug, color, sort_order = 0, translations = {} }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.execute(
        'INSERT INTO categories (key_slug, color, sort_order) VALUES (?, ?, ?)',
        [key_slug, color ?? null, sort_order]
      );
      for (const [locale, t] of Object.entries(translations)) {
        await conn.execute(
          'INSERT INTO category_translations (category_id, locale, name, slug) VALUES (?, ?, ?, ?)',
          [result.insertId, locale, t.name, t.slug]
        );
      }
      await conn.commit();
      return result.insertId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async update(id, { color, sort_order, translations = {} }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      if (color !== undefined || sort_order !== undefined) {
        await conn.execute(
          'UPDATE categories SET color = COALESCE(?, color), sort_order = COALESCE(?, sort_order) WHERE id = ?',
          [color ?? null, sort_order ?? null, id]
        );
      }
      for (const [locale, t] of Object.entries(translations)) {
        await conn.execute(
          `INSERT INTO category_translations (category_id, locale, name, slug) VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug)`,
          [id, locale, t.name, t.slug]
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async remove(id) {
    // Posts keep existing, uncategorised (FK is ON DELETE SET NULL).
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
  }
}

/** "Bastiaan van Roekel" -> "bastiaan-van-roekel". Accents are folded, not dropped. */
export function slugifyName(name) {
  return String(name)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

export class Author {
  static async list() {
    const [rows] = await pool.query(
      `SELECT a.*, m.path AS avatar_url
         FROM authors a
         LEFT JOIN media m ON m.id = a.avatar_id
        ORDER BY a.name`
    );
    return rows;
  }

  /** The public author page. Returns null for an unknown slug. */
  static async findBySlug(slug) {
    const [rows] = await pool.execute(
      `SELECT a.*, m.path AS avatar_url
         FROM authors a
         LEFT JOIN media m ON m.id = a.avatar_id
        WHERE a.slug = ?
        LIMIT 1`,
      [slug]
    );
    return rows[0] ?? null;
  }

  /** Authors who have at least one published post - the only ones worth a public page. */
  static async listPublished() {
    const [rows] = await pool.query(
      `SELECT a.id, a.slug, a.name
         FROM authors a
         JOIN posts p ON p.author_id = a.id AND p.status = 'published'
        WHERE a.slug IS NOT NULL AND a.slug <> ''
        GROUP BY a.id, a.slug, a.name
        ORDER BY a.name`
    );
    return rows;
  }

  /**
   * A slug is derived from the name unless one is supplied, and kept unique by suffixing
   * -2, -3, … Uniqueness is enforced by the column too; this just avoids handing the
   * editor a raw duplicate-key error.
   */
  static async uniqueSlug(desired, excludeId = null) {
    const base = slugifyName(desired) || 'author';
    let candidate = base;
    for (let n = 2; n < 50; n += 1) {
      const [rows] = await pool.execute(
        `SELECT id FROM authors WHERE slug = ? ${excludeId ? 'AND id <> ?' : ''} LIMIT 1`,
        excludeId ? [candidate, excludeId] : [candidate]
      );
      if (rows.length === 0) return candidate;
      candidate = `${base}-${n}`;
    }
    return `${base}-${Date.now()}`;
  }

  static async create({ name, slug, role, bio, avatar_id }) {
    const finalSlug = await Author.uniqueSlug(slug || name);
    const [result] = await pool.execute(
      'INSERT INTO authors (name, slug, role, bio, avatar_id) VALUES (?, ?, ?, ?, ?)',
      [name, finalSlug, role ?? null, bio ?? null, avatar_id ?? null]
    );
    return result.insertId;
  }

  static async update(id, { name, slug, role, bio, avatar_id }) {
    // Only re-slug when a slug is explicitly supplied. Renaming an author must not move
    // a page that is already indexed and linked to.
    const finalSlug = slug ? await Author.uniqueSlug(slug, id) : null;
    await pool.execute(
      `UPDATE authors
          SET name = COALESCE(?, name),
              slug = COALESCE(?, slug),
              role = ?, bio = ?, avatar_id = ?
        WHERE id = ?`,
      [name ?? null, finalSlug, role ?? null, bio ?? null, avatar_id ?? null, id]
    );
  }

  static async remove(id) {
    await pool.execute('DELETE FROM authors WHERE id = ?', [id]);
  }
}
