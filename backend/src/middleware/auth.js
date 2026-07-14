// Admin session + CSRF.
//
// The session is a JWT in an httpOnly cookie. Because the admin, the API and the
// public site share one origin, `SameSite=Lax` already blocks cross-site POSTs - but
// Lax does NOT cover the multipart upload endpoint, which a cross-site <form> can
// legitimately submit. So every mutation also carries a double-submit CSRF token:
// the value is in a JS-readable cookie, and the client must echo it in a header
// that a cross-origin form has no way to set.

import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env, isProd } from '../config/env.js';
import { Admin } from '../models/Admin.js';

const SESSION_COOKIE = 'cc_session';
const CSRF_COOKIE = 'cc_csrf';
const CSRF_HEADER = 'x-csrf-token';
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12h - a working day, not a month

export function issueSession(res, admin) {
  const token = jwt.sign({ sub: admin.id, role: admin.role }, env.JWT_SECRET, {
    expiresIn: MAX_AGE_MS / 1000,
  });

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true, // XSS cannot read it
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_MS,
  });

  res.cookie(CSRF_COOKIE, crypto.randomBytes(24).toString('hex'), {
    httpOnly: false, // the admin JS must read this to echo it back
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_MS,
  });
}

export function clearSession(res) {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.clearCookie(CSRF_COOKIE, { path: '/' });
}

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return res.status(401).json({ success: false, message: 'Not signed in.' });

  try {
    const { sub } = jwt.verify(token, env.JWT_SECRET);
    const admin = await Admin.findById(sub);
    // The account may have been deleted since the token was issued.
    if (!admin) {
      clearSession(res);
      return res.status(401).json({ success: false, message: 'Not signed in.' });
    }
    req.admin = admin;
    next();
  } catch {
    clearSession(res);
    res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.admin?.role)) {
      return res.status(403).json({ success: false, message: 'You do not have access to that.' });
    }
    next();
  };
}

export function verifyCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const cookie = req.cookies?.[CSRF_COOKIE];
  const header = req.get(CSRF_HEADER);

  if (!cookie || !header || cookie.length !== header.length) {
    return res.status(403).json({ success: false, message: 'Invalid CSRF token.' });
  }
  if (!crypto.timingSafeEqual(Buffer.from(cookie), Buffer.from(header))) {
    return res.status(403).json({ success: false, message: 'Invalid CSRF token.' });
  }
  next();
}
