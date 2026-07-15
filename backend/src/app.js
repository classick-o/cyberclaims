// The API. Mounted at /api by server.js, which also serves the Astro site around it.

import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import leadsRouter from './routes/public/leads.js';
import healthRouter from './routes/public/health.js';

import authRouter from './routes/admin/auth.js';
import postsRouter from './routes/admin/posts.js';
import mediaRouter from './routes/admin/media.js';
import { categories, authors } from './routes/admin/taxonomy.js';
import { leads } from './routes/admin/leads.js';

import { requireAuth, verifyCsrf } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export const api = express.Router();

api.use(helmet({ contentSecurityPolicy: false })); // CSP belongs on the HTML, not the API
api.use(cookieParser());
api.use(express.json({ limit: '1mb' })); // 1mb: an article body, not a form

// The forms keep their native `method="post" action="/api/lead"`, so if the client JS
// ever fails to load the browser still submits - as urlencoded, and the lead still
// lands. See routes/public/leads.js for the redirect that closes that path.
api.use(express.urlencoded({ extended: false, limit: '32kb' }));

// Public
api.use('/lead', leadsRouter);
api.use('/health', healthRouter);

// Admin
// /auth is mounted OUTSIDE requireAuth - you cannot be authenticated in order to log
// in. It carries its own CSRF exemption on /login for the same reason: the token is
// issued by that call, so requiring it beforehand is a chicken-and-egg lock-out.
api.use('/admin/auth', authRouter);

const admin = express.Router();
admin.use(requireAuth, verifyCsrf);
admin.use('/posts', postsRouter);
admin.use('/media', mediaRouter);
admin.use('/categories', categories);
admin.use('/authors', authors);
admin.use('/leads', leads);
api.use('/admin', admin);

api.use(notFound);
api.use(errorHandler);
