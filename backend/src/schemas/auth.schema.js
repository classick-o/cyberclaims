import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(255),
  // No complexity rules on LOGIN - the password either matches the stored hash or it
  // doesn't. Enforcing "must contain a symbol" here would only leak policy to an
  // attacker. Strength is enforced where passwords are set: scripts/seed-admin.js.
  password: z.string().min(1, 'Enter your password.').max(200),
});
