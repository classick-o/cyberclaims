import { z } from 'zod';

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
    .regex(/^[+0-9()\-.\s]+$/, 'Please enter a valid phone number.'),

  // Which language the PDF comes back in. Mirrors the phone-check locale set.
  locale: z.enum(['en', 'nl', 'de', 'it', 'es', 'pt', 'fr']).default('en'),

  // Honeypot — declared so .strip() doesn't drop it before the middleware sees it.
  _honey: z.string().max(0).optional(),
});
