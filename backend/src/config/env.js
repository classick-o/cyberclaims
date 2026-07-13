// Environment, validated at boot.
//
// The point is to fail at startup with a readable message instead of at 3am with
// `undefined is not a function`. Dev is deliberately permissive: without SMTP or
// Turnstile the app still boots and leads still save (emails and captcha become
// no-ops). Production is strict — the site's forms promise "Protected by CAPTCHA"
// and a confirmation email, so booting prod without them would ship a lie.

import 'dotenv/config';
import { z } from 'zod';

// `SMTP_USER=` in a .env file arrives as '', not undefined — so .optional() and
// .default() would never fire and a deliberately-blank optional var would fail
// validation. Drop the blanks first and let the schema mean what it says.
const present = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => value !== undefined && value !== '')
);

const optional = z.string().trim().min(1).optional();

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    SITE_URL: z.string().url().default('http://localhost:3000'),

    // Number of proxies in front of us (Cloudflare = 1, bare VPS = 0).
    // Must NOT be `true`: that makes X-Forwarded-For spoofable and turns rate
    // limiting into decoration.
    TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),

    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive().default(3306),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().default(''), // a passwordless local MySQL is legitimate
    DB_NAME: z.string().min(1),

    SMTP_HOST: optional,
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: optional,
    SMTP_PASS: optional,
    MAIL_FROM: z.string().email().optional(),
    MAIL_FROM_NAME: z.string().default('Cyberclaims'),
    NOTIFICATION_EMAIL: z.string().email().optional(),

    TURNSTILE_SECRET: optional,
  })
  .superRefine((v, ctx) => {
    if (v.NODE_ENV !== 'production') return;
    for (const key of [
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS',
      'MAIL_FROM',
      'NOTIFICATION_EMAIL',
      'TURNSTILE_SECRET',
    ]) {
      if (!v[key]) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: 'is required in production' });
      }
    }
  });

const parsed = schema.safeParse(present);

if (!parsed.success) {
  const lines = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`);
  console.error(`\nInvalid environment — refusing to start:\n${lines.join('\n')}\n`);
  console.error('See .env.example for the full list.\n');
  process.exit(1);
}

export const env = parsed.data;

export const isProd = env.NODE_ENV === 'production';
export const emailEnabled = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
export const turnstileEnabled = Boolean(env.TURNSTILE_SECRET);
