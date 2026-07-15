// ESM boot module, loaded via dynamic import() from the CommonJS entry (server.cjs).
// It must be reached through import(), never require(): Hostinger's LiteSpeed loader
// (/usr/local/lsws/fcgi-bin/lsnode.js) require()s the entry file, and require() throws
// ERR_REQUIRE_ASYNC_MODULE on any ESM graph that uses top-level await — which this and
// backend/server.js both do. server.cjs is the require()-safe shim; this file does the
// real work.
//
// Two jobs here:
//  1. Load .env by ABSOLUTE path. Passenger/lsnode does NOT set cwd to the app root, so
//     `import 'dotenv/config'` (which reads ./.env relative to cwd) finds nothing and the
//     app would exit on "Invalid environment". env vars must be populated before
//     backend/src/config/env.js evaluates, so load dotenv first, then dynamic-import the
//     rest of the app.
//  2. Apply migrations in-process, best-effort.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdir, readFile } from 'node:fs/promises';
import dotenv from 'dotenv';

const ROOT = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(ROOT, '.env') });

// env.js reads process.env (now populated) and validates it.
const { env } = await import('./backend/src/config/env.js');

// Migrations run in-process — no child process, no inherited stdio, no process.exit
// — because any of those can wedge the Passenger boot. On failure we log and start
// anyway: backend/server.js degrades gracefully when a table is missing, which beats
// taking the whole site down over a transient DB hiccup.
async function runMigrations() {
  let conn;
  try {
    // Imported here, not at module top, so a transient module-resolution glitch
    // right after a redeploy (e.g. mysql2's 'sql-escaper' not yet on disk) is
    // caught and the site still starts, instead of the whole boot dying.
    const mysql = (await import('mysql2/promise')).default;
    conn = await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      charset: 'utf8mb4',
      multipleStatements: true, // trusted .sql files on disk only, never request input
    });
    await conn.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name       VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    const [rows] = await conn.query('SELECT name FROM _migrations');
    const applied = new Set(rows.map((r) => r.name));
    const pending = (await readdir(join(ROOT, 'backend', 'migrations')))
      .filter((f) => f.endsWith('.sql'))
      .sort()
      .filter((f) => !applied.has(f));
    for (const file of pending) {
      await conn.query(await readFile(join(ROOT, 'backend', 'migrations', file), 'utf8'));
      await conn.execute('INSERT INTO _migrations (name) VALUES (?)', [file]);
      console.log(`migration applied: ${file}`);
    }
    console.log(pending.length ? `applied ${pending.length} migration(s)` : 'migrations up to date');
  } catch (err) {
    console.error(`migrations skipped (${err.code || err.message}); starting anyway`);
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
}

await runMigrations();
await import('./backend/server.js');
