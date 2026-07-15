// Environment, validated at boot.
//
// The point is to fail at startup with a readable message instead of at 3am with
// `undefined is not a function`. Dev is deliberately permissive: without SMTP or
// Turnstile the app still boots and leads still save (emails and captcha become
// no-ops). Production is strict - the site's forms promise "Protected by CAPTCHA"
// and a confirmation email, so booting prod without them would ship a lie.

import 'dotenv/config';
import { z } from 'zod';

// `SMTP_USER=` in a .env file arrives as '', not undefined - so .optional() and
// .default() would never fire and a deliberately-blank optional var would fail
// validation. Drop the blanks first and let the schema mean what it says.
const present = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => value !== undefined && value !== '')
);

const optional = z.string().trim().min(1).optional();

// The bootstrap admin's fallback password. Public by design: it is baked in so a
// freshly hosted copy of the site is never locked out with zero configuration (see the
// ADMIN_* block below and server.js). Named so server.js can warn when a *production*
// deploy is still running on it. Override ADMIN_PASSWORD in the host environment.
export const DEFAULT_ADMIN_PASSWORD = 'Cyb3rClaims-Admin-2026!';

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    SITE_URL: z.string().url().default('http://localhost:3000'),

    // Whether search engines may index the site. Default 'false' so a fresh deployment
    // — and the cyberclaims.nl staging domain — is never accidentally indexed. Flip to
    // 'true' only on the real production domain (cyberclaims.net). Drives the robots
    // <meta>, the X-Robots-Tag header, and robots.txt. Read at BUILD time for the meta
    // (so rebuild after changing it) and at runtime for the header + robots.txt.
    ALLOW_INDEXING: z.enum(['true', 'false']).default('false'),

    // Number of proxies in front of us (Cloudflare = 1, bare VPS = 0).
    // Must NOT be `true`: that makes X-Forwarded-For spoofable and turns rate
    // limiting into decoration.
    TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),

    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive().default(3306),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().default(''), // a passwordless local MySQL is legitimate
    DB_NAME: z.string().min(1),

    // Signs the admin session cookie. Rotating it logs everyone out - that's the
    // intended emergency response, not a bug.
    JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),

    // The bootstrap admin account, (re)provisioned on every server start (see
    // server.js -> Admin.ensureSeedAccount). This is what guarantees the site is never
    // hosted without a working admin login, wherever it runs. All three have defaults
    // so a zero-config copy still boots with a usable account; override them - the
    // password above all - in any real deployment's environment.
    ADMIN_EMAIL: z.string().email().default('admin@cyberclaims.net'),
    ADMIN_PASSWORD: z.string().min(12, 'must be at least 12 characters').default(DEFAULT_ADMIN_PASSWORD),
    ADMIN_NAME: z.string().min(1).default('Admin account'),

    // Days after a lead is CLOSED before it is deleted. GDPR Art. 5(1)(e): personal
    // data may not be kept longer than the purpose requires, and these rows record how
    // much money a victim lost. 0 disables the job.
    LEAD_RETENTION_DAYS: z.coerce.number().int().min(0).max(3650).default(730),

    // Where uploaded media is written and served from.
    UPLOAD_DIR: z.string().default('uploads'),
    MAX_UPLOAD_MB: z.coerce.number().int().positive().max(50).default(8),

    SMTP_HOST: optional,
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: optional,
    SMTP_PASS: optional,
    MAIL_FROM: z.string().email().optional(),
    MAIL_FROM_NAME: z.string().default('Cyberclaims'),
    NOTIFICATION_EMAIL: z.string().email().optional(),

    TURNSTILE_SECRET: optional,

    // ScamInfo partner API (phone-number scam reports). The key is a server secret,
    // never exposed to the browser. When absent, /api/phone-report returns a friendly
    // 503 rather than the whole site refusing to boot — the report is one feature, not
    // a precondition for serving.
    SCAMINFO_API_KEY: optional,
    SCAMINFO_API_URL: z.string().url().default('https://api.test.scaminfo.ai'),
    // The test gateway (api.test.scaminfo.ai) sits behind HTTP Basic auth on top of the
    // API key. Defaults match the test environment; unset/override on production.
    SCAMINFO_BASIC_USER: optional,
    SCAMINFO_BASIC_PASS: optional,
  });

const parsed = schema.safeParse(present);

if (!parsed.success) {
  const lines = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`);
  console.error(`\nInvalid environment:\n${lines.join('\n')}\n`);
  console.error('See .env.example for the full list.\n');
  process.exit(1);
}

export const env = parsed.data;

export const isProd = env.NODE_ENV === 'production';
export const allowIndexing = env.ALLOW_INDEXING === 'true';
export const emailEnabled = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
export const turnstileEnabled = Boolean(env.TURNSTILE_SECRET);
export const scaminfoEnabled = Boolean(env.SCAMINFO_API_KEY);

/**
 * Runtime preconditions for a production server. Called from server.js - deliberately
 * NOT enforced at module load.
 *
 * The Astro build imports this module (the blog pages read the database directly) and
 * Vite sets NODE_ENV=production while building. Enforcing "you must have SMTP
 * credentials" at import time therefore killed the *build*, on a machine that is not
 * serving anything and has no business holding production secrets.
 *
 * Parsing the environment and asserting it is fit to serve traffic are two different
 * questions. This is the second one.
 */
export function assertServeable() {
  if (!isProd) return;

  const missing = [
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'MAIL_FROM',
    'NOTIFICATION_EMAIL',
    // The forms say "Protected by CAPTCHA". Booting production without a Turnstile
    // secret would make that a lie, so it is a hard requirement, not a nice-to-have.
    'TURNSTILE_SECRET',
  ].filter((key) => !env[key]);

  if (missing.length > 0) {
    console.error(
      `\nRefusing to serve in production without:\n${missing.map((m) => `  ${m}`).join('\n')}\n`
    );
    process.exit(1);
  }

  if (env.JWT_SECRET.startsWith('dev-only')) {
    console.error('\nRefusing to serve in production with the development JWT_SECRET.\n');
    process.exit(1);
  }
}
