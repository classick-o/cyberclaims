import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { isCountryCode, countryNameEn } from '../services/countryData.js';

// Deliberately permissive. Only a name and an email are enforced; every other field
// is optional even when the HTML marks it `required` (that's client-side UX).
//
// The people filling in these forms have just lost money to fraud. Rejecting a
// submission because the "Country" box was blank loses a lead - and a lead is the
// entire point of the site. Validate lengths so nothing overflows the column, then
// take whatever they give us.

const text = (max) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .optional()
    .transform((v) => v || null);

// <input type="date"> submits '' when empty and YYYY-MM-DD otherwise.
const date = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date.')
  .optional()
  .or(z.literal(''))
  .transform((v) => v || null);

// Which forms actually ask for these. Keep in step with the markup: a source listed here
// whose form has no such input would reject every submission from it.
const COUNTRY_SOURCES = new Set(['hero', 'contact', 'start_process', 'landing']);
const PHONE_SOURCES = new Set(['hero', 'contact', 'start_process', 'landing', 'investigator']);

/**
 * E.164 from the dial code + national number the form posts, or null when the pair is
 * not a real number for that country. Falls back to parsing `phone` on its own so a
 * pasted "+44 20 7946 0958" still works.
 */
function toE164({ phone, phone_dial: dial, country_code: iso }) {
  if (!phone) return null;
  const raw = String(phone).trim();
  const candidates = [
    dial && !raw.startsWith('+') ? `+${String(dial).replace(/\D/g, '')}${raw.replace(/\D/g, '')}` : null,
    raw,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const parsed = parsePhoneNumberFromString(candidate, isCountryCode(iso) ? iso.toUpperCase() : undefined);
    if (parsed?.isValid()) return parsed.number;
  }
  return null;
}

export const leadSchema = z.object({
  source: z.enum(['hero', 'contact', 'start_process', 'url_checker', 'landing', 'investigator', 'scam_report'], {
    errorMap: () => ({ message: 'Unknown form.' }),
  }),

  // The forms post first_name + last_name; full_name is composed below and remains the
  // column every email, export and admin view already reads. It stays accepted on its own
  // so anything still posting a single name (an old cached page, an integration) works.
  first_name: text(100),
  last_name: text(100),
  full_name: z.string().trim().max(200, 'Name is too long.').optional(),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address.')
    .max(255, 'Email is too long.'),

  phone: text(50),
  /** Calling code without the plus, e.g. '31'. Combined with `phone` into E.164 below. */
  phone_dial: text(6),
  country: text(100),
  /** ISO 3166-1 alpha-2 from the country select; `country` is derived from it. */
  country_code: text(2),
  message: text(5000),

  // ── scam-report form (phone checker) ──
  // `phone` above is the reporter's own number; this is the number being reported.
  reported_number: text(50),
  scam_type: text(120),
  // 'yes'/'no' from the toggle. Left undefined by every other form, which the model
  // stores as NULL so "didn't lose money" stays distinct from "wasn't asked".
  lost_money: z
    .enum(['yes', 'no'])
    .optional()
    .transform((v) => (v === undefined ? null : v === 'yes')),

  amount: text(100),
  platform_name: text(255),
  platform_website: text(500),
  first_transaction: date,
  last_transaction: date,

  locale: z.string().trim().max(5).default('en'),

  // Turnstile injects this into the form; verified in middleware, never stored.
  'cf-turnstile-response': z.string().max(4096).optional(),

  // Honeypot. Handled before validation, but declared so `.strip()` doesn't
  // surprise us and so an unexpected value can't sneak through.
  _honey: z.string().max(0).optional(),
})
  // ── identity: validate what the split fields posted, then normalise ──────────
  //
  // Which fields are mandatory depends on the form. Every lead form collects a name;
  // only some collect a country (the investigator and scam-report forms have no country
  // input at all), so requiring one globally would reject those outright.
  .superRefine((v, ctx) => {
    const wantsCountry = COUNTRY_SOURCES.has(v.source);
    const wantsPhone = PHONE_SOURCES.has(v.source);
    const fail = (path, message) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    // A name is required on every form. Either half missing is only an error when the
    // legacy single full_name wasn't sent instead.
    if (!v.full_name) {
      if (!v.first_name) fail('first_name', 'Please enter your first name.');
      if (!v.last_name) fail('last_name', 'Please enter your surname.');
    }

    if (wantsCountry && !isCountryCode(v.country_code)) {
      fail('country_code', 'Please select your country of residence.');
    }

    if (wantsPhone) {
      if (!v.phone) fail('phone', 'Please enter your phone number.');
      else if (!toE164(v)) fail('phone', 'Please enter a valid phone number for that country.');
    }
  })
  .transform((v) => {
    // full_name stays the canonical column: composed here so it is correct even when the
    // browser posted natively and no client script ran.
    const composed = [v.first_name, v.last_name].filter(Boolean).join(' ').trim();
    const e164 = toE164(v);

    return {
      ...v,
      full_name: composed || v.full_name || null,
      // Store the CODE plus the canonical English name, never the visitor's language.
      country_code: isCountryCode(v.country_code) ? v.country_code.toUpperCase() : null,
      country: isCountryCode(v.country_code) ? countryNameEn(v.country_code) : v.country,
      // E.164 when we can build it; otherwise whatever was typed, so a lead is never lost
      // to a number we merely failed to parse.
      phone: e164 ?? v.phone,
    };
  });
