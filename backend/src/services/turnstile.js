// Cloudflare Turnstile verification.
//
// The forms have always claimed "Protected by CAPTCHA" while having none. This makes
// that true. Turnstile is standalone — it does not require the site to be behind
// Cloudflare's CDN, only a (free) Cloudflare account for the key pair.
//
// Without TURNSTILE_SECRET this is a no-op, so local dev needs no setup. Production
// refuses to boot without it (see config/env.js).

import { env, turnstileEnabled } from '../config/env.js';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function verifyTurnstile(req, res, next) {
  if (!turnstileEnabled) return next();

  const token = req.body?.['cf-turnstile-response'];
  if (!token) {
    return res.status(400).json({
      success: false,
      errors: [{ field: 'captcha', message: 'Please complete the captcha and try again.' }],
    });
  }

  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
  if (req.ip) body.set('remoteip', req.ip);

  // 5s ceiling: if Cloudflare is slow we'd rather take the lead than stall the form.
  const timeout = AbortSignal.timeout(5000);

  fetch(VERIFY_URL, { method: 'POST', body, signal: timeout })
    .then((r) => r.json())
    .then((result) => {
      if (result.success) return next();
      console.warn('Turnstile rejected a submission:', result['error-codes']);
      res.status(400).json({
        success: false,
        errors: [{ field: 'captcha', message: 'Captcha verification failed. Please try again.' }],
      });
    })
    .catch((err) => {
      // Fail OPEN. Turnstile being unreachable is our problem, not the victim's —
      // dropping a lead because Cloudflare timed out is the worse failure. The rate
      // limiter and honeypot still stand between us and a spam flood.
      console.error('Turnstile unreachable, allowing submission through:', err.message);
      next();
    });
}
