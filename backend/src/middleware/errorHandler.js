import { isProd } from '../config/env.js';

export function notFound(req, res, next) {
  if (!req.path.startsWith('/api/')) return next();
  res.status(404).json({ success: false, message: 'Not found.' });
}

// Express recognises an error handler by its arity — the unused `next` is load-bearing.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  // A 400 is the caller's mistake and is already phrased for them; only real faults
  // are worth a stack trace in the log.
  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
  }

  if (res.headersSent) return;

  // Field-level errors keep the shape the client already knows how to render.
  if (err.errors) {
    return res.status(status).json({ success: false, errors: err.errors });
  }

  res.status(status).json({
    success: false,
    message:
      status < 500
        ? err.message
        : isProd
          ? 'An internal error occurred. Please try again later.'
          : err.message,
  });
}
