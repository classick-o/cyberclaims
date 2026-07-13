import { pool } from '../config/database.js';

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
}
