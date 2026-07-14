# Deploying Cyberclaims

A handoff for whoever takes this site to the client's domain. Read the first two sections
before touching anything: the single most common mistake is treating this like a static
site (it is not) and the second is running the build without the production `SITE_URL`.

Everything below uses plain values you replace. Where it says `www.cyberclaims.net`, that is
the currently assumed production domain (it is baked into `astro.config.mjs`, `robots.txt`
and the `@cyberclaims.net` email addresses). Swap it for the real domain if it differs.

---

## 1. What this app is (and why Pages cannot host it)

This is **not** a static site. It is one Node process (`backend/server.js`, Express) that
serves four things on the same origin:

- `/api/*` - the backend (leads, admin auth, blog CMS, media uploads)
- `/admin` - the admin SPA (a React build in `admin/dist`)
- the prerendered marketing site - static HTML from `dist/client`
- the on-demand routes - `/news/*`, `/sitemap.xml`, and the homepage's article strip,
  which render from MySQL at request time (Astro's Node middleware adapter, hybrid mode:
  `output: 'static'` + `@astrojs/node`)

Because the blog, the sitemap and the admin all need a running Node server and a database,
**GitHub Pages (or any static host) cannot serve this project.** It needs a Node host and a
MySQL database.

```
Browser --HTTPS--> reverse proxy (nginx/Caddy, TLS) --> Node (Express, PORT) --> MySQL
                                                            '--> serves dist/client + admin/dist
```

---

## 2. Remove the GitHub Pages setup

The site was briefly wired for GitHub Pages. That has to be undone so nothing serves a
stale, broken static copy.

- **Repo Settings -> Pages:** set Source to "None" (disable Pages). If a Pages deployment
  exists at a `*.github.io` URL, it is serving a half-working copy with no backend - kill it.
- **Delete `public/.nojekyll`.** It is a Pages-only marker. (`dist/` is git-ignored and
  regenerated, so ignore the copy that appears there.)
- **Never set `BASE_PATH` in production.** `astro.config.mjs` reads it and, when present,
  builds the whole site under a sub-path (`/<repo>/...`). That was only for Pages. On the
  real domain the site lives at `/`, so leave `BASE_PATH` unset.
- **CI:** `.github/workflows/ci.yml` already has **no deploy job** - it only builds and
  typechecks on push. There is nothing Pages-related left to remove there. Leave it, or add
  a real deploy job once the host is chosen (see section 7).
- If a `CNAME` DNS record still points the domain at GitHub Pages, repoint it at the new
  server (section 8).

---

## 3. Prerequisites on the server

- **Node 22** (CI builds on 22; there is no `engines` pin, so match it).
- **MySQL 8** or **MariaDB** (the SQL avoids `JSON_*` functions specifically so MariaDB
  works). A managed database from the host is fine.
- **A reverse proxy that terminates TLS** (nginx, Caddy, or the host's built-in). The Node
  process speaks plain HTTP on `PORT`; HTTPS is the proxy's job.
- **A process manager** so the app restarts on crash/reboot (PM2 or systemd).
- `docker-compose.yml` in the repo is **local-dev only** (a throwaway MySQL). Do not run it
  in production - use the host's database.

---

## 4. Environment variables

One `.env` file at the **repo root** feeds both the Astro build and the API (they are the
same process). `.env` is git-ignored; copy `.env.example` and fill it in. Full reference is
in `.env.example`; this table is what actually changes for production.

| Variable | What it does | Production action |
| --- | --- | --- |
| `NODE_ENV` | dev vs prod behaviour | **Set to `production`.** This flips on the strict boot checks below. |
| `SITE_URL` | canonical URLs, hreflang, `og:url`, sitemap base | **Set to `https://www.cyberclaims.net`.** Needed at **build time** (see section 6). |
| `PORT` | internal port the Node process listens on | e.g. `3000`. The reverse proxy forwards to it. |
| `TRUST_PROXY` | number of proxies in front of the app | `1` behind one nginx/Cloudflare. Never `true` (makes rate limiting spoofable). |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | MySQL connection | Set to the production database. |
| `JWT_SECRET` | signs the admin session cookie | **Set a fresh 32+ char random.** `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. Must not start with `dev-only`. Rotating it logs every admin out. |
| `ADMIN_EMAIL` `ADMIN_PASSWORD` `ADMIN_NAME` | the bootstrap admin login (section 6) | **Override `ADMIN_PASSWORD`** - the default is public in the repo. |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` | outbound email (lead confirmations + alerts) | Real SMTP. For Google Workspace use an **App Password**, not the login password. |
| `MAIL_FROM` `MAIL_FROM_NAME` | the "from" address on confirmation emails | The client's address, e.g. `contact@cyberclaims.net`. |
| `NOTIFICATION_EMAIL` | where new-lead alerts are sent | The inbox the client watches. |
| `PUBLIC_TURNSTILE_SITEKEY` | Cloudflare Turnstile widget (the visible captcha) | **Real sitekey.** Needed at **build time**. The `.env.example` value is Cloudflare's public test key. |
| `TURNSTILE_SECRET` | server-side captcha verification | **Real secret.** Free from a Cloudflare account (no CDN needed). |
| `UPLOAD_DIR` | where uploaded media is written | Default `uploads` (repo-root relative). Must persist + be backed up (section 9). |
| `MAX_UPLOAD_MB` | per-file upload cap | Default `8`. |
| `LEAD_RETENTION_DAYS` | GDPR auto-delete of closed leads | Default `730` (2 years). `0` disables the job - be ready to justify that. |

**In production the server refuses to boot** (this is deliberate, see `assertServeable` in
`backend/src/config/env.js`) unless all of these are set: `SMTP_HOST`, `SMTP_USER`,
`SMTP_PASS`, `MAIL_FROM`, `NOTIFICATION_EMAIL`, `TURNSTILE_SECRET`, and a `JWT_SECRET` that
is not the dev one. The forms promise "Protected by CAPTCHA" and a confirmation email;
booting without them would ship a lie.

---

## 5. Build-time vs runtime (the gotcha that bites everyone)

`astro.config.mjs` and some components read env **while building**, not just at runtime:

- `SITE_URL` -> baked into every canonical link, hreflang tag, `og:url`, and the sitemap.
  Build with the wrong (or missing) value and the whole site advertises
  `https://www.cyberclaims.net` regardless of where it actually runs.
- `PUBLIC_TURNSTILE_SITEKEY` -> baked into the HTML of every form. Missing at build = the
  captcha widget renders nothing (forms still submit, but unprotected).

So the `.env` must be complete **before `npm run build`**, not just before `npm start`.
`DB_*` and `JWT_SECRET` only need to be *present* for the build (the schema parses them; the
build never opens a DB connection) - they must be *correct* by the time the server starts.

---

## 6. First deploy, step by step

```bash
# 1. Get the code and dependencies
git clone <repo> cyberclaims && cd cyberclaims
npm install                      # not `npm ci` - see the note in ci.yml about lock drift

# 2. Create the production .env (section 4). Do this BEFORE building.
cp .env.example .env
#   edit .env: NODE_ENV=production, SITE_URL, DB_*, JWT_SECRET, SMTP_*, Turnstile, ADMIN_*, ...

# 3. Create the schema (needs the live DB)
npm run migrate

# 4. Build the site + the admin SPA (reads SITE_URL + PUBLIC_TURNSTILE_SITEKEY)
npm run build

# 5. Start it (behind your process manager, see section 7)
npm start                        # node backend/server.js, listens on PORT
```

Verify: `curl -s http://localhost:$PORT/api/health` returns ok, the homepage loads, `/admin`
shows the login, and a test lead from the contact form arrives by email.

---

## 7. Reverse proxy + keeping it alive

**nginx** (TLS via certbot/Let's Encrypt), forwarding to the Node process:

```nginx
server {
  server_name www.cyberclaims.net cyberclaims.net;
  client_max_body_size 10m;               # allow media uploads (see MAX_UPLOAD_MB)

  location / {
    proxy_pass http://127.0.0.1:3000;     # match PORT
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  # listen 443 ssl; ... certbot fills this in
}
```

With one proxy in front, set `TRUST_PROXY=1` so rate limiting sees the real client IP.

**PM2** (simplest process manager):

```bash
npm i -g pm2
pm2 start npm --name cyberclaims -- start
pm2 save && pm2 startup            # restart on reboot
```

Or a **systemd** unit running `npm start` in the repo dir with `Restart=always` and the
`.env` loaded. Either is fine; the point is auto-restart on crash and reboot.

---

## 8. DNS

Point the domain's `A`/`AAAA` records at the server's IP (or a `CNAME` at the host). If the
domain currently resolves to GitHub Pages, that is the record to change. Then issue the TLS
certificate for both `www.` and the apex.

`public/robots.txt` hardcodes `Sitemap: https://www.cyberclaims.net/sitemap.xml` - update it
if the real domain differs, otherwise search engines are pointed at the wrong host.

---

## 9. The admin account

There is **no public signup** - accounts only come from the server.

- **Bootstrap admin, auto-provisioned on every start.** On boot the server ensures the
  account in `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` exists (creates it if missing,
  re-syncs the password if it changed). This is what guarantees the site is never hosted
  without a working login. Code: `Admin.ensureSeedAccount` (`backend/src/models/Admin.js`),
  called from `backend/server.js`.
- **The default password (`Cyb3rClaims-Admin-2026!`) is public in the repo.** Set your own
  `ADMIN_PASSWORD` in the production `.env` before first boot. The server logs a warning if
  it boots in production still using the default.
- **Log in at** `https://<domain>/admin`.
- **More people?** Add editors/admins without redeploying:
  `npm run seed:admin -- --email jane@client.com --name "Jane" --role admin`
  (roles: `admin` or `editor`; omit `--password` and one is generated and printed once).
- The old placeholder account (`julia@cyberclaims.net`) has already been removed.

---

## 10. Persistence and backups

- **Database:** the real content. Schedule regular `mysqldump` backups.
- **`uploads/`:** every image the CMS has uploaded. It is git-ignored and lives outside the
  build, so it is **not** recreated by a redeploy. Keep it on persistent storage and back it
  up. If you deploy by cloning fresh each time, this directory must be preserved/symlinked
  across releases or all media 404s.
- **GDPR:** `LEAD_RETENTION_DAYS` runs an in-process job that deletes closed leads after N
  days. It only runs while the server is up.

---

## 11. Redeploying an update

```bash
git pull
npm install
npm run migrate      # applies any new migrations; a no-op if none
npm run build        # SITE_URL + PUBLIC_TURNSTILE_SITEKEY must be in .env
pm2 restart cyberclaims
```

`uploads/` and the database are untouched by this. Migrations are tracked in a `_migrations`
table and each runs once.

---

## 12. Go-live checklist

- [ ] GitHub Pages disabled; `public/.nojekyll` deleted; `BASE_PATH` unset.
- [ ] `NODE_ENV=production` and the server boots (proves SMTP/Turnstile/JWT are all real).
- [ ] `SITE_URL` set to the real domain **and the site rebuilt** with it.
- [ ] `ADMIN_PASSWORD` changed from the repo default; you can log in at `/admin`.
- [ ] Real `JWT_SECRET`, `DB_*`, `SMTP_*`, `PUBLIC_TURNSTILE_SITEKEY` + `TURNSTILE_SECRET`.
- [ ] `TRUST_PROXY` matches the number of proxies; captcha shows on the forms.
- [ ] A test lead submits, saves, and both the confirmation + the alert email arrive.
- [ ] `robots.txt` sitemap line points at the real domain; `/sitemap.xml` loads.
- [ ] `uploads/` is on persistent, backed-up storage; DB backups scheduled.
- [ ] Process manager restarts the app on crash and reboot.

---

## 13. Troubleshooting

- **Build succeeds but every canonical/hreflang URL is `www.cyberclaims.net`** - `SITE_URL`
  was not set when you ran `npm run build`. Rebuild with it in `.env`.
- **Forms have no captcha in production** - `PUBLIC_TURNSTILE_SITEKEY` was missing at build
  time. Rebuild.
- **Server exits at boot with "Refusing to serve in production without..."** - a required
  prod variable is missing (section 4). The message names it.
- **`/admin` is 404** - the admin SPA was not built. Run `npm run build` (it builds both the
  site and the admin), then confirm `admin/dist/index.html` exists.
- **DB connection refused / auth error on a managed MySQL** - some hosts default the user to
  `caching_sha2_password`; if the driver struggles, create the app user with
  `mysql_native_password`, or confirm host/port/TLS settings with the provider.
- **404s on the blog after deploy** - `/news/*` is server-rendered from MySQL; make sure
  migrations ran and the DB has the posts.
