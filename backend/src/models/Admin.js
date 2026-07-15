import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

const ROUNDS = 12;

export class Admin {
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id, email, password_hash, name, role FROM admins WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] ?? null;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, name, role FROM admins WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  }

  static async create({ email, password, name, role = 'editor' }) {
    const [result] = await pool.execute(
      'INSERT INTO admins (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email.toLowerCase(), await bcrypt.hash(password, ROUNDS), name, role]
    );
    return result.insertId;
  }

  static async touchLogin(id) {
    await pool.execute('UPDATE admins SET last_login_at = NOW() WHERE id = ?', [id]);
  }

  /**
   * Guarantee a bootstrap admin exists. Called on every server start so a freshly
   * hosted copy of the site is never locked out - the account is created if missing,
   * and its password/name/role are realigned to the configured values if they drift
   * (there is no in-app password change, so the environment is the source of truth).
   *
   * Idempotent: when the row already matches the config it does nothing, so a restart
   * costs neither a bcrypt hash nor a write. Returns 'created' | 'updated' | 'unchanged'
   * for the boot log.
   */
  static async ensureSeedAccount({ email, password, name, role = 'admin' }) {
    const lower = email.toLowerCase();
    const existing = await this.findByEmail(lower);

    if (!existing) {
      await this.create({ email: lower, password, name, role });
      return 'created';
    }

    const inSync =
      existing.name === name &&
      existing.role === role &&
      (await bcrypt.compare(password, existing.password_hash));
    if (inSync) return 'unchanged';

    await pool.execute(
      'UPDATE admins SET password_hash = ?, name = ?, role = ? WHERE id = ?',
      [await bcrypt.hash(password, ROUNDS), name, role, existing.id]
    );
    return 'updated';
  }

  /**
   * Always runs a hash comparison, even when the account doesn't exist. Returning
   * early on an unknown email makes the response measurably faster, which turns the
   * login form into an account-enumeration oracle.
   */
  static async verify(email, password) {
    const admin = await this.findByEmail(email.toLowerCase());
    const hash = admin?.password_hash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi';
    const ok = await bcrypt.compare(password, hash);
    return ok && admin ? { id: admin.id, email: admin.email, name: admin.name, role: admin.role } : null;
  }
}
