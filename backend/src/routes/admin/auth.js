import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Admin } from '../../models/Admin.js';
import { loginSchema } from '../../schemas/auth.schema.js';
import { validate } from '../../middleware/validate.js';
import { issueSession, clearSession, requireAuth } from '../../middleware/auth.js';

const router = Router();

// 10 attempts / 15 min, counted per IP+email so one attacker hammering many accounts
// from one address gets throttled, and a legitimate user isn't locked out because
// someone else on their NAT fat-fingered a password.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${req.body?.email ?? ''}`,
  message: { success: false, message: 'Too many sign-in attempts. Try again in 15 minutes.' },
});

router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const admin = await Admin.verify(req.body.email, req.body.password);

    // One message for "no such account" and for "wrong password". Distinguishing them
    // tells an attacker which addresses are worth attacking.
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    issueSession(res, admin);
    await Admin.touchLogin(admin.id);
    res.json({ success: true, admin });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  clearSession(res);
  res.json({ success: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

export default router;
