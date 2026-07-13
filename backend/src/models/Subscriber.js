import { randomBytes } from 'node:crypto';
import { pool } from '../config/database.js';

export class Subscriber {
  /**
   * Double opt-in. Returns { token, alreadyConfirmed } — the caller sends the
   * confirmation mail only when there's something to confirm.
   *
   * Re-subscribing an existing pending address reissues the token rather than
   * erroring: people lose the first email, and "you're already on the list (but not
   * really)" is a dead end for them and a lost subscriber for us.
   */
  static async subscribe({ email, locale = 'en', ip_address = null }) {
    const token = randomBytes(24).toString('hex');

    const [rows] = await pool.execute(
      'SELECT id, status FROM newsletter_subscribers WHERE email = ? LIMIT 1',
      [email]
    );
    const existing = rows[0];

    if (existing?.status === 'confirmed') {
      return { token: null, alreadyConfirmed: true };
    }

    if (existing) {
      await pool.execute(
        "UPDATE newsletter_subscribers SET token = ?, status = 'pending', locale = ? WHERE id = ?",
        [token, locale, existing.id]
      );
    } else {
      await pool.execute(
        'INSERT INTO newsletter_subscribers (email, locale, token, ip_address) VALUES (?, ?, ?, ?)',
        [email, locale, token, ip_address]
      );
    }

    return { token, alreadyConfirmed: false };
  }

  static async confirm(token) {
    const [result] = await pool.execute(
      `UPDATE newsletter_subscribers
          SET status = 'confirmed', confirmed_at = NOW()
        WHERE token = ? AND status = 'pending'`,
      [token]
    );
    return result.affectedRows > 0;
  }

  static async unsubscribe(token) {
    const [result] = await pool.execute(
      "UPDATE newsletter_subscribers SET status = 'unsubscribed' WHERE token = ?",
      [token]
    );
    return result.affectedRows > 0;
  }

  static async list({ status = null, limit = 100, offset = 0 } = {}) {
    const [rows] = await pool.query(
      `SELECT id, email, locale, status, confirmed_at, created_at
         FROM newsletter_subscribers
        ${status ? 'WHERE status = ?' : ''}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
      status ? [status, Number(limit), Number(offset)] : [Number(limit), Number(offset)]
    );
    return rows;
  }

  static async remove(id) {
    await pool.execute('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);
  }
}
