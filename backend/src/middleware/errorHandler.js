import { isProd } from '../config/env.js';

/**
 * The last handler in the /api router: anything that gets here is an /api path that
 * matched no route.
 *
 * There used to be a `if (!req.path.startsWith('/api/')) return next()` guard in front
 * of this, and it never once fired. Inside a router mounted at /api, `req.path` is
 * RELATIVE to the mount point - a request for /api/nope arrives here as '/nope'. So the
 * guard always took the next() branch, every unknown API call escaped the router, and
 * Astro was handed it instead: a GET came back as the site's HTML 404 page (so the admin
 * SPA got HTML where it expected JSON), and a POST came back a 500, because express.json()
 * had already drained the request body that Astro's adapter then tried to read.
 *
 * No guard is needed. Being mounted here IS the condition.
 */
export function notFound(_req, res) {
  res.status(404).json({ success: false, message: 'Not found.' });
}

// Express recognises an error handler by its arity - the unused `next` is load-bearing.
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
