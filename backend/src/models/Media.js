import { pool } from '../config/database.js';
import { toLimit, toOffset } from '../services/pagination.js';

// mysql2 hands JSON columns back already parsed on MySQL, but as a string on
// MariaDB (where JSON is an alias for LONGTEXT). Normalise so the app never has to
// care which one the host is running.
const parseJson = (v) => {
  if (v == null) return null;
  if (typeof v === 'object') return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

const hydrate = (row) =>
  row && { ...row, variants: parseJson(row.variants) };

export class Media {
  static async create({ filename, path, variants, mime, width, height, bytes, alt, locale = 'en' }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.execute(
        `INSERT INTO media (filename, path, variants, mime, width, height, bytes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [filename, path, JSON.stringify(variants ?? {}), mime, width ?? null, height ?? null, bytes ?? null]
      );
      if (alt) {
        await conn.execute(
          'INSERT INTO media_translations (media_id, locale, alt) VALUES (?, ?, ?)',
          [result.insertId, locale, alt]
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

  /** @returns {Promise<{ rows: object[], total: number }>} one page plus the full count. */
  static async list({ limit = 50, offset = 0, locale = 'en' } = {}) {
    const [rows] = await pool.query(
      `SELECT m.*, t.alt
         FROM media m
         LEFT JOIN media_translations t ON t.media_id = m.id AND t.locale = ?
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?`,
      [locale, toLimit(limit, { def: 50 }), toOffset(offset)]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM media');
    return { rows: rows.map(hydrate), total };
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM media WHERE id = ? LIMIT 1', [id]);
    return hydrate(rows[0]);
  }

  static async setAlt(id, locale, alt) {
    await pool.execute(
      `INSERT INTO media_translations (media_id, locale, alt) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE alt = VALUES(alt)`,
      [id, locale, alt]
    );
  }

  /** Returns the row so the caller can unlink the files it points at. */
  static async remove(id) {
    const media = await this.findById(id);
    if (media) await pool.execute('DELETE FROM media WHERE id = ?', [id]);
    return media;
  }
}
