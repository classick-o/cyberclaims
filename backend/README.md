# Backend

Express + MySQL, in the **same Node process** as the Astro site. Express owns `/api`,
`/admin` and `/uploads`; everything else falls through to Astro's handler.

That single-process design is why the forms post to a relative `/api/lead` with no
CORS, why the admin's session cookie works with `SameSite=Lax`, why an editor can
preview a draft on the real site, and why the blog pages read the database through a
direct model call instead of an HTTP round-trip.

## Run it

```bash
cp .env.example .env     # defaults match the docker-compose MySQL
npm install
npm run db:up            # MySQL 8 in Docker
npm run migrate
npm run seed:admin -- --email you@cyberclaims.net --name "Your Name" --role admin
```

Then either:

```bash
# Two processes, hot reload on both. Site :4321, API :3000.
# astro.config.mjs proxies /api to :3000, so the forms hit a same-origin
# /api/lead in dev exactly as in production.
npm run dev:api
npm run dev
npm run dev:admin        # optional — the admin on :5173, also proxied

# Or one process, like production:
npm run build && npm start        # everything on :3000
```

In development, SMTP and Turnstile may be blank — emails and captcha become no-ops and
leads still save. **Production refuses to boot without them** (`assertServeable()` in
`src/config/env.js`), because the forms promise "Protected by CAPTCHA" and a
confirmation email, and shipping without either would make that a lie. It also refuses
to start with the development `JWT_SECRET`.

## Layout

```
server.js               Express host: /api, /admin, /uploads, static, then Astro, then 404
src/app.js              the /api router
src/config/env.js       validates the environment; assertServeable() gates production
src/config/database.js  mysql2 pool — prepared statements only
src/middleware/         auth (JWT + CSRF), validate (zod), honeypot, rate limit, upload, security (CSP)
src/models/             raw SQL, static methods
src/routes/public/      lead, health
src/routes/admin/       auth, posts, media, taxonomy, leads
src/services/           email, turnstile, content (sanitise/slug/reading-time), contentCache,
                        csv, dbErrors, retention
migrations/             *.sql, applied in filename order
scripts/                migrate.js, seed-admin.js
```

## Things that will bite you if you don't know them

**Astro bundles what it imports.** The blog pages import `backend/src/models/*`, and
Astro's build copies those modules into `dist/server/`. So Express and Astro each hold
their *own instance* of any module that isn't a package. Module-level state is
therefore **not shared** — the content cache and the connection pool are anchored on
`globalThis` via `Symbol.for(...)` for exactly this reason. Without that, publishing an
article cleared Express's copy of the cache while Astro kept serving from its own, and
the article stayed 404 for five minutes. If you add shared state, anchor it the same
way.

**`ON DUPLICATE KEY UPDATE` is a trap on `post_translations`.** That table has two
unique keys — `(post_id, locale)` and `(locale, slug)` — and the clause fires on
*either*. An upsert therefore silently overwrites a *different* article when two titles
slug to the same string. `Post.save` does an explicit SELECT-then-UPDATE/INSERT keyed on
`(post_id, locale)` instead. Don't "simplify" it back.

**The Astro build imports this code**, so it loads `env.js`. That is why production
requirements live in `assertServeable()` (called from `server.js`) rather than at module
load: enforcing them at import time killed the build, on a machine that has no business
holding production secrets.

**MySQL commits DDL implicitly**, so `migrate.js` has no transactional rollback. A
migration that fails halfway stays unrecorded; fix the SQL and any half-applied state by
hand, then re-run.

## API

**Public**

| | | |
|---|---|---|
| `POST` | `/api/lead` | All three forms. `source` = `hero` \| `contact` \| `start_process`. 5/15min per IP. |
| `GET` | `/api/health` | `{ ok: true }`. Nothing else — deliberately. |

`POST /api/lead` accepts JSON (the fetch path) **and** urlencoded (the native form post
that happens if the client JS fails to load). The urlencoded path answers `303 →
/thank-you/`, so a lead is never lost to a JavaScript error — and, more importantly, the
victim's name, email and losses never end up in a URL.

**Admin** — JWT in an httpOnly cookie, plus a double-submit CSRF token on every mutation.

`/api/admin/auth/{login,logout,me}` · `/posts` (+ `/:id/status`) · `/media` ·
`/categories` · `/authors` · `/leads` (+ `/export.csv`)

Errors: `400 { success: false, errors: [{ field, message }] }`.

## Articles live at the root of the site

`/<slug>/`, not `/news/<slug>/`. `/news/` is still the listing; only the articles moved.
Old URLs 301 to the new ones (`server.js`), so nothing that already linked to one breaks.

The cost of that scheme is that an article's slug now shares a namespace with every page
on the site, and **a page always wins the route**. An article slugged `about-us` would
save, report itself as published, and be permanently unreachable — with nothing anywhere
to say why. So `RESERVED_SLUGS` in `src/services/content.js` refuses the collision at the
door, where there is still a person to tell. **Keep that list in step with
`src/pages/[...lang]/*` and `src/content/legal/*`.** Add a page, add its path there.

## The newsletter is gone

It was built (double opt-in, confirmation email, subscriber list, CSV export) and then
cut — the product does not want one. Every line of code for it has been removed.

Two things survive it, on purpose:

- **`migrations/005_newsletter.sql` and the `newsletter_subscribers` table.** Migrations
  are an append-only history; deleting one that has already run rewrites the past and
  leaves any database that applied it disagreeing with the ledger. The table is simply
  unused now. If you want it gone, add a *new* migration that drops it — and do, because
  it still holds addresses collected under a consent we are no longer honouring, and an
  email address nobody has a purpose for is a GDPR liability, not an asset.
- **The privacy policy still mentions it** ("your email address if you subscribe to our
  newsletter"). That is a legal document; a lawyer edits it, not this repo.
