import { Router } from 'express';
import { Lead } from '../../models/Lead.js';
import { leadSchema } from '../../schemas/lead.schema.js';
import { validate, honeypot } from '../../middleware/validate.js';
import { leadLimiter } from '../../middleware/rateLimiter.js';
import { verifyTurnstile } from '../../services/turnstile.js';
import { sendLeadNotification, sendLeadConfirmation } from '../../services/emailService.js';

const router = Router();

// The single endpoint behind all three forms (hero, contact, start-process).
// `source` in the body says which one; the columns they don't fill stay NULL.
//
// Order matters: honeypot is free, the rate limiter is cheap, Turnstile costs a
// network round-trip, so we only pay for it on submissions that already look real.
router.post('/', honeypot, leadLimiter, validate(leadSchema), verifyTurnstile, async (req, res, next) => {
  try {
    const lead = {
      ...req.body,
      ip_address: req.ip,
      user_agent: req.get('User-Agent') ?? null,
    };

    const leadId = await Lead.create(lead);

    // Fire and forget. The lead is in the database; if SMTP is down that's an
    // operational problem for us, not a reason to tell the user their submission
    // failed and have them walk away.
    sendLeadNotification(lead, leadId).catch((err) =>
      console.error(`Lead #${leadId}: notification email failed -`, err.message)
    );
    sendLeadConfirmation(lead).catch((err) =>
      console.error(`Lead #${leadId}: confirmation email failed -`, err.message)
    );

    // A urlencoded body means the browser submitted natively - the client JS didn't
    // run. It can't render our inline success state, so send it somewhere that can.
    if (!req.is('application/json')) {
      return res.redirect(303, '/thank-you/');
    }

    res.status(201).json({
      success: true,
      message: 'Your details have been received. Our team will respond within 48 hours.',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
