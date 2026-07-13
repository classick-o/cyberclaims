// The API. Mounted at /api by server.js, which also serves the Astro site around it.

import express from 'express';
import helmet from 'helmet';
import leadsRouter from './routes/public/leads.js';
import healthRouter from './routes/public/health.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export const api = express.Router();

api.use(helmet({ contentSecurityPolicy: false })); // CSP is set on the HTML, not the API
api.use(express.json({ limit: '32kb' }));

// The forms keep their native `method="post" action="/api/lead"`, so if the client
// JS ever fails to load the browser still submits — as urlencoded, and the lead
// still lands. See routes/public/leads.js for the redirect that closes that path.
api.use(express.urlencoded({ extended: false, limit: '32kb' }));

api.use('/lead', leadsRouter);
api.use('/health', healthRouter);

api.use(notFound);
api.use(errorHandler);
