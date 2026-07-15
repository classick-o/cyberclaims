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

// The phone report proxies a paid, rate-limited partner API and each call runs a live
// ~60s analysis, so the backstop here is tighter than the lead form: 6 reports per IP
// per hour is plenty for a real visitor and makes scripted abuse pointless.
export const phoneReportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You have requested several reports recently. Please try again in an hour.',
  },
});
