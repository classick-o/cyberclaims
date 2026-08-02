import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

// The phone-check landing pages POST here. We only need the number and the language
// for the report; the country dropdown on the page has already folded its dial code
// into `phone_number` (E.164) before submit, so it is not sent separately.
export const phoneReportSchema = z.object({
  phone_number: z
    .string()
    .trim()
    .min(4, 'Please enter a phone number.')
    .max(32, 'That phone number is too long.')
    // digits, spaces, and the usual separators a person types; nothing exotic
    .regex(/^[+0-9()\-.\s]+$/, 'Please enter a valid phone number.')
    // Validated against the country's REAL number plan (Google's libphonenumber), not a
    // digit count: +44 99 9999 9999 is a plausible 12 digits but is not a UK number, and
    // a length check happily forwarded it.
    //
    // The client validates too, but that is a courtesy to the visitor - this is the check
    // that matters. The endpoint is public and every call past here spends partner-API
    // quota, so it must be the server that decides what is worth forwarding.
    //
    // The number arrives in E.164 (the page parses it before submitting), so no default
    // country is supplied: anything without a country code is genuinely ambiguous here.
    .refine((v) => isValidPhoneNumber(v), {
      message: 'Please enter a valid phone number, including the country code.',
    }),

  // Which language the PDF comes back in. Mirrors the phone-check locale set.
  locale: z.enum(['en', 'nl', 'de', 'it', 'es', 'pt', 'fr']).default('en'),

  // Honeypot — declared so .strip() doesn't drop it before the middleware sees it.
  _honey: z.string().max(0).optional(),
});
