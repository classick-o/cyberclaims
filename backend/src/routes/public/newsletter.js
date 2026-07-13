import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Subscriber } from '../../models/Subscriber.js';
import { newsletterSchema } from '../../schemas/post.schema.js';
import { validate, honeypot } from '../../middleware/validate.js';
import { verifyTurnstile } from '../../services/turnstile.js';
import { sendNewsletterConfirmation } from '../../services/emailService.js';

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
});

router.post('/', honeypot, limiter, validate(newsletterSchema), verifyTurnstile, async (req, res, next) => {
  try {
    const { email, locale } = req.body;
    const { token, alreadyConfirmed } = await Subscriber.subscribe({
      email,
      locale,
      ip_address: req.ip,
    });

    if (token) {
      await sendNewsletterConfirmation({ email, token }).catch((err) =>
        console.error('Newsletter confirmation email failed:', err.message)
      );
    }

    // Deliberately the same answer whether or not they were already subscribed (hence
    // `alreadyConfirmed` deciding only whether to send mail, not what to say). Replying
    // "you're already on the list" turns this form into an oracle for testing whether a
    // given address belongs to one of our subscribers — people who were defrauded and
    // would rather that not be discoverable by anyone who can type an email address.
    void alreadyConfirmed;
    res.status(201).json({
      success: true,
      message: 'Thanks — check your inbox to confirm your subscription.',
    });
  } catch (err) {
    next(err);
  }
});

router.get('/confirm', async (req, res, next) => {
  try {
    const ok = await Subscriber.confirm(String(req.query.token ?? ''));
    res.redirect(303, ok ? '/news/?subscribed=1' : '/news/?subscribed=0');
  } catch (err) {
    next(err);
  }
});

router.get('/unsubscribe', async (req, res, next) => {
  try {
    await Subscriber.unsubscribe(String(req.query.token ?? ''));
    // Always report success. If the token is stale the address isn't on the list
    // anyway, and "unsubscribe failed" is the most infuriating page on the internet.
    res.redirect(303, '/news/?unsubscribed=1');
  } catch (err) {
    next(err);
  }
});

export default router;
