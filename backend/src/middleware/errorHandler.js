import { isProd } from '../config/env.js';

export function notFound(req, res, next) {
  if (!req.path.startsWith('/api/')) return next();
  res.status(404).json({ success: false, message: 'Not found.' });
}

// Express recognises an error handler by its arity — the unused `next` is load-bearing.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);

  if (res.headersSent) return;

  res.status(err.status || 500).json({
    success: false,
    message: isProd
      ? 'An internal error occurred. Please try again later.'
      : err.message,
  });
}
