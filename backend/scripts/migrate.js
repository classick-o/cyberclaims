// Minimal migration runner. Applies every migrations/*.sql not yet recorded in
// `_migrations`, in filename order.
//
// No transaction wrapper: MySQL implicitly commits on DDL, so BEGIN/ROLLBACK around
// a CREATE TABLE is theatre. A migration is recorded only after it succeeds, so a
// failure leaves it pending — fix the SQL (or the half-applied state) and re-run.
//
//   node backend/scripts/migrate.js

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { env } from '../src/config/env.js';

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

const conn = await mysql.createConnection({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  charset: 'utf8mb4',
  // Safe here and ONLY here: the input is trusted .sql files on disk, never a request.
  multipleStatements: true,
});

await conn.query(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name       VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`);

const [rows] = await conn.query('SELECT name FROM _migrations');
const applied = new Set(rows.map((r) => r.name));

const pending = (await readdir(MIGRATIONS_DIR))
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .filter((f) => !applied.has(f));

if (pending.length === 0) {
  console.log('Migrations up to date.');
  await conn.end();
  process.exit(0);
}

for (const file of pending) {
  process.stdout.write(`  ${file} ... `);
  try {
    await conn.query(await readFile(join(MIGRATIONS_DIR, file), 'utf8'));
    await conn.execute('INSERT INTO _migrations (name) VALUES (?)', [file]);
    console.log('ok');
  } catch (err) {
    console.log('FAILED');
    console.error(`\n${err.message}\n`);
    await conn.end();
    process.exit(1);
  }
}

console.log(`\nApplied ${pending.length} migration(s).`);
await conn.end();
