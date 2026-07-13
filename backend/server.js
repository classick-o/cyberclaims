// One process: Express owns /api, Astro renders everything else.
//
// This is why the forms can keep posting to the relative /api/lead they already have
// in their markup — no CORS, no cross-domain URL hardcoded in a component (TBSBV has
// `https://www.app.tbsbv.com/api/leads` written into Contact.astro), and later the
// admin's session cookie is same-origin for free.

import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import express from 'express';
import { env } from './src/config/env.js';
import { api } from './src/app.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CLIENT_DIR = join(ROOT, 'dist', 'client');
const SERVER_ENTRY = join(ROOT, 'dist', 'server', 'entry.mjs');
const ADMIN_DIR = join(ROOT, 'admin', 'dist');
const UPLOAD_DIR = resolve(ROOT, env.UPLOAD_DIR);

await mkdir(UPLOAD_DIR, { recursive: true });

const app = express();

// The COUNT of proxies in front of us, never `true`: with `true`, anyone can forge
// X-Forwarded-For and the rate limiter becomes decoration.
app.set('trust proxy', env.TRUST_PROXY);
app.disable('x-powered-by');

app.use('/api', api);

// Uploaded media. Filenames are content-random and never reused, so these are
// immutable. `dotfiles: 'deny'` and no `index` because this directory holds user-
// supplied content — it should serve exactly the files we wrote and nothing else.
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    maxAge: '1y',
    immutable: true,
    index: false,
    dotfiles: 'deny',
    setHeaders(res) {
      // Belt and braces: even though every file was re-encoded to WebP by sharp,
      // never let a browser sniff one of them into something executable.
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', 'inline');
    },
  })
);

// The admin SPA. Same origin as the API, which is what lets the session cookie work
// with SameSite=Lax and no CORS at all. `noindex` is set in its HTML, but say it in
// the headers too — a CMS login page in Google results is an invitation.
if (existsSync(ADMIN_DIR)) {
  app.use('/admin', (_req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  });
  app.use('/admin', express.static(ADMIN_DIR, { index: false }));
  // Client-side routing: /admin/posts/12 is a React route, not a file on disk.
  app.get(/^\/admin(\/.*)?$/, (_req, res) => res.sendFile(join(ADMIN_DIR, 'index.html')));
}

if (existsSync(CLIENT_DIR)) {
  // Astro content-hashes everything under /_astro, so it can be cached forever.
  app.use('/_astro', express.static(join(CLIENT_DIR, '_astro'), { maxAge: '1y', immutable: true }));

  // Prerendered HTML + whatever came from public/. These keep their filenames across
  // deploys, so they must revalidate — an immutable index.html would pin visitors to
  // the previous release.
  app.use(
    express.static(CLIENT_DIR, {
      setHeaders(res, path) {
        res.setHeader(
          'Cache-Control',
          path.endsWith('.html')
            ? 'public, max-age=0, must-revalidate'
            : 'public, max-age=3600'
        );
      },
    })
  );
}

if (existsSync(SERVER_ENTRY)) {
  // Astro takes what's left. Today that's nothing — every page prerenders — but this
  // is the hook the blog will hang off once /news/* sets `prerender = false`.
  // pathToFileURL because Node refuses a bare Windows path in a dynamic import.
  const { handler } = await import(pathToFileURL(SERVER_ENTRY).href);
  app.use(handler);
} else {
  console.warn(
    '\nNo Astro build found in dist/ — running API-only.\n' +
      '  npm run dev     Astro dev server on :4321, proxying /api to this process\n' +
      '  npm run build && npm start   serve the built site from this process\n'
  );
}

app.listen(env.PORT, () => {
  console.log(`Cyberclaims on http://localhost:${env.PORT}  [${env.NODE_ENV}]`);
});
