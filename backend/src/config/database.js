// MySQL connection pool. Every query in the app goes through this, always with
// prepared statements (`pool.execute`) — never string interpolation.

import mysql from 'mysql2/promise';
import { env } from './env.js';

// Anchored on globalThis for the same reason as the content cache: Astro bundles this
// file into its SSR output, so a plain module-level `const` would give Express and
// Astro a pool each — two pools, twice the connections, for one process.
const POOL = Symbol.for('cyberclaims.pool');

export const pool = (globalThis[POOL] ??= mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z',
}));

export async function pingDatabase() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SELECT 1');
  } finally {
    conn.release();
  }
}
