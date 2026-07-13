import rateLimit from 'express-rate-limit';

// 5 submissions per IP per 15 minutes. Generous for a human filling in one form,
// tight enough to make bulk spam pointless. Turnstile is the real gate; this is the
// backstop for when it is misconfigured or bypassed.
export const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submissions from this address. Please try again in 15 minutes.',
  },
});
