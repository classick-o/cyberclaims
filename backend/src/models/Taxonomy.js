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

  /** Only categories that actually have published posts — an empty filter tab is noise. */
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

  static async create({ name, role, bio, avatar_id }) {
    const [result] = await pool.execute(
      'INSERT INTO authors (name, role, bio, avatar_id) VALUES (?, ?, ?, ?)',
      [name, role ?? null, bio ?? null, avatar_id ?? null]
    );
    return result.insertId;
  }

  static async update(id, { name, role, bio, avatar_id }) {
    await pool.execute(
      `UPDATE authors
          SET name = COALESCE(?, name), role = ?, bio = ?, avatar_id = ?
        WHERE id = ?`,
      [name ?? null, role ?? null, bio ?? null, avatar_id ?? null, id]
    );
  }

  static async remove(id) {
    await pool.execute('DELETE FROM authors WHERE id = ?', [id]);
  }
}
