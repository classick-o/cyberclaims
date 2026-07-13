# Backend

Express + MySQL, in the same Node process as the Astro site. Express owns `/api`;
everything else falls through to Astro's handler. See [../BACKEND-PLAN.md](../BACKEND-PLAN.md)
for the architecture and what's coming.

## Run it locally

```bash
cp .env.example .env     # defaults match the docker-compose MySQL below
npm install
npm run db:up            # MySQL 8 in Docker
npm run migrate          # apply migrations/*.sql
```

Then either:

```bash
# Two processes — hot reload on both. Site on :4321, API on :3000.
# astro.config.mjs proxies /api from the dev server, so the forms hit a
# same-origin /api/lead exactly as they do in production.
npm run dev:api
npm run dev

# Or one process, like production: build the site, serve it from Express on :3000.
npm run build && npm start
```

`.env` needs no SMTP or Turnstile keys in development — emails and captcha become
no-ops and leads still save. **Production refuses to boot without them**
(`src/config/env.js`), because the forms promise "Protected by CAPTCHA" and a
confirmation email, and shipping without either would make that a lie.

## Layout

```
server.js              Express host; mounts /api, serves dist/client, hands the rest to Astro
src/app.js             the /api router
src/config/env.js      validates the environment at boot — strict in production
src/config/database.js mysql2 pool; every query is a prepared statement
src/middleware/        validate (zod), honeypot, rate limit, error handler
src/models/            raw SQL, static methods
src/routes/public/     lead, health
src/schemas/           zod request schemas
src/services/          email (nodemailer), turnstile
migrations/            *.sql, applied in filename order
scripts/migrate.js     runner; records what it applied in `_migrations`
```

## Adding a migration

Create `migrations/00N_thing.sql` and run `npm run migrate`. MySQL commits DDL
implicitly, so there is no transactional rollback — a migration that fails halfway
stays unrecorded and you fix the SQL (and any half-applied state) by hand.

## API

| | | |
|---|---|---|
| `POST` | `/api/lead` | All three forms. `source` = `hero` \| `contact` \| `start_process`. 5/15min per IP. |
| `GET` | `/api/health` | `{ ok: true }`. Nothing else — deliberately. |

`POST /api/lead` accepts JSON (the fetch path) *and* urlencoded (the native form post
that happens if the client JS fails to load). The urlencoded path answers `303 → /thank-you/`
so a lead is never lost to a JavaScript error.

Errors come back as `400 { success: false, errors: [{ field, message }] }`.
