import { pool } from '../config/database.js';
import { toLimit, toOffset } from '../services/pagination.js';

export class Lead {
  static async create({
    full_name,
    email,
    phone,
    country,
    message,
    amount,
    platform_name,
    platform_website,
    first_transaction,
    last_transaction,
    source,
    locale,
    ip_address,
    user_agent,
  }) {
    const [result] = await pool.execute(
      `INSERT INTO leads
         (full_name, email, phone, country, message,
          amount_lost, platform_name, platform_website, first_transaction, last_transaction,
          source, locale, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        email,
        phone ?? null,
        country ?? null,
        message ?? null,
        amount ?? null,
        platform_name ?? null,
        platform_website ?? null,
        first_transaction ?? null,
        last_transaction ?? null,
        source,
        locale ?? 'en',
        ip_address ?? null,
        user_agent ?? null,
      ]
    );

    return result.insertId;
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────
  //
  // TBSBV's leads table has the same `status` column and nothing in the codebase can
  // change it — the leads are triaged by hand in phpMyAdmin. These are the methods
  // that were missing.

  static async list({ status = null, source = null, q = null, limit = 50, offset = 0 } = {}) {
    const where = [];
    const params = [];
    if (status) { where.push('status = ?'); params.push(status); }
    if (source) { where.push('source = ?'); params.push(source); }
    if (q) {
      where.push('(full_name LIKE ? OR email LIKE ? OR platform_name LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT * FROM leads ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, toLimit(limit), toOffset(offset)]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM leads ${clause}`,
      params
    );
    return { rows, total };
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM leads WHERE id = ? LIMIT 1', [id]);
    return rows[0] ?? null;
  }

  static async setStatus(id, status) {
    const [result] = await pool.execute('UPDATE leads SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  }

  /**
   * Hard delete. This is the GDPR right-to-erasure endpoint, so it must actually
   * remove the row — a soft-delete flag would leave the personal data (how much they
   * lost, on which platform, when) sitting in the table after we told them it was gone.
   */
  static async remove(id) {
    const [result] = await pool.execute('DELETE FROM leads WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async all() {
    const [rows] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    return rows;
  }

  /** Deletes leads closed longer ago than `days`. Retention, not housekeeping. */
  static async purgeClosedOlderThan(days) {
    const [result] = await pool.execute(
      `DELETE FROM leads
        WHERE status = 'closed' AND updated_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    );
    return result.affectedRows;
  }
}
