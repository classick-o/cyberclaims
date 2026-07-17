import { z } from 'zod';

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

export const leadSchema = z.object({
  source: z.enum(['hero', 'contact', 'start_process', 'url_checker', 'landing'], {
    errorMap: () => ({ message: 'Unknown form.' }),
  }),

  full_name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(200, 'Name is too long.'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address.')
    .max(255, 'Email is too long.'),

  phone: text(50),
  country: text(100),
  message: text(5000),

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
});
