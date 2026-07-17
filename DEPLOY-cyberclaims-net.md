# Deploying to cyberclaims.net (production)

A runbook for standing the app up on **cyberclaims.net**, the real production domain.
`cyberclaims.nl` is the staging/preview copy and stays **noindex**; `.net` is the one
that search engines are allowed to see.

This is the same Node app deployed to a second Hostinger vhost, with its own `.env` and
its own database. It was written from the actual `.nl` bring-up, so every gotcha below is
one that really bit — read §7 before your first deploy.

---

## 0. What you're deploying

One Node process (`server.cjs` → `boot.mjs` → `backend/server.js`, Express) that serves
the marketing site, `/admin` (CMS), `/api/*`, the blog (`/news/*` + article routes,
rendered from MySQL), and `/sitemap.xml`. It is **not** a static site — it needs Node 22
and MySQL. Hostinger runs it under LiteSpeed/Passenger.

---

## 1. Prerequisites on Hostinger

- `cyberclaims.net` already exists as an **addon domain** on the hosting account
  (`u399670331`), root `…/domains/cyberclaims.net/public_html`. If it doesn't, create the
  website first (hPanel → Websites → Add, or the API `hosting_createWebsiteV1` with the
  plan's `order_id`).
- Node.js app support (it's the same plan as `.nl`, so it's there).
- Access via the Hostinger API MCP (the `.mcp.json` in this repo) or hPanel.

---

## 2. Database (dedicated for production)

Create a **separate** database so staging and production never share data:

- hPanel → Databases → create DB + user, **or** API
  `hosting_createAccountDatabaseV1` with `website_domain: cyberclaims.net`.
- Use a fresh strong password. Note the final **prefixed** names, e.g.
  `u399670331_ccnet` / user `u399670331_ccnet`.

Schema is created automatically on first boot (`boot.mjs` runs the migrations), so no
manual import is needed — but the DB and user must exist and the credentials must be
correct before the app starts.

---

## 3. The production `.env`

Copy the working `.nl` `.env` and change only what's listed. `.env` is git-ignored and
ships **inside the deploy archive** (never commit it).

| Variable | `.nl` (staging) | **`.net` (production)** |
| --- | --- | --- |
| `SITE_URL` | `https://cyberclaims.nl` | **`https://cyberclaims.net`** — baked into canonical, hreflang, og:url, sitemap **at build time** |
| `ALLOW_INDEXING` | `false` | **`true`** — turns on indexing (robots allow + drops the noindex meta/header). Read at **build** for the meta, so you must rebuild after changing it |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | `.nl` DB | **the `.net` DB from §2** |
| `DB_HOST` / `DB_PORT` | `127.0.0.1` / `3306` | same |
| `UPLOAD_DIR` | `…/domains/cyberclaims.nl/uploads` | **`/home/u399670331/domains/cyberclaims.net/uploads`** (outside `public_html`, survives redeploys) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | staging admin | a fresh production admin — **change the password** |
| `JWT_SECRET` | staging secret | **a fresh 48-byte random** (`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`) |
| `NODE_ENV` | `production` | `production` (Passenger forces this anyway) |
| `TRUST_PROXY` | `1` | `1` |
| `SMTP_*`, `MAIL_FROM`, `NOTIFICATION_EMAIL` | Google Workspace | same (or a `@cyberclaims.net` sender) |
| `PUBLIC_TURNSTILE_SITEKEY` / `TURNSTILE_SECRET` | test keys | **real Cloudflare Turnstile keys** — the sitekey is baked at build |
| `SCAMINFO_API_URL` / `SCAMINFO_API_KEY` | test | the production ScamInfo host + a valid key |
| `LEAD_RETENTION_DAYS` | `730` | `730` |

Production must have **real** SMTP + Turnstile + a non-dev `JWT_SECRET` or the app
refuses to boot (`assertServeable` in `backend/src/config/env.js`) — that's deliberate.

---

## 4. Build & package (the important part)

**Always build the archive as a forward-slash ZIP.** Windows PowerShell's
`Compress-Archive` writes backslash paths, which silently break Astro's content-layer
glob on the Linux build — the symptom is *all legal pages 404 and the blog collection is
empty*, with a green build. Use the helper that emits POSIX paths.

```powershell
# 1. Stage the tree, excluding what the server rebuilds or shouldn't get.
#    NOTE: exclude backend/scripts/seed/media too if the articles are ALREADY seeded on
#    this domain — those 23MB only need to ship on the FIRST deploy (see §6).
robocopy . <stage> /E /XD node_modules dist .git .astro uploads api .claude /XF .mcp.json *.log

# 2. Make a forward-slash zip (scripts/make-zip.ps1 pattern used for .nl):
#    walks the stage, CreateEntry with name.Replace('\','/').
```

Deploy settings that must resolve (they auto-detect from `package.json`):

- `node_version: 22` (Node 20 fails — `sanitize-html`/`file-type` need ≥22, and the ESM
  entry needs 22's loader)
- `entry_file: server.cjs` (driven by `"main": "server.cjs"` in package.json)
- `build_script: build`

---

## 5. Deploy

Via the MCP:

```
hosting_deployJsApplication({ domain: "cyberclaims.net", archivePath: "<the .zip>" })
```

(Auto-detect reads `package.json` from the **zip** — it does **not** work on `tar.gz`, so
ship a zip.) Watch the build with `hosting_listJsDeployments` / `hosting_getNodeJSBuildLogsV1`;
then `hosting_restartNode_jsApplicationV1` to pick up the new build.

---

## 6. Post-deploy: admin + articles

- **Migrations** run automatically at boot (`boot.mjs`) — no action needed.
- **Admin account** is provisioned from `ADMIN_*` at boot. Log in at
  `https://cyberclaims.net/admin` and change the password if you used a placeholder.
- **Articles** are seeded from the bundled WordPress import. It's idempotent (skips if
  already seeded), so run it once via a cron **single command** (Hostinger's cron mangles
  `&&`/pipes, and the script resolves its own paths, so no `cd`):

  ```
  /opt/alt/alt-nodejs22/root/bin/node /home/u399670331/domains/cyberclaims.net/nodejs/backend/scripts/seed-articles.js
  ```

  It copies the WebP into `UPLOAD_DIR` and inserts authors/categories/media/posts, then
  delete the cron. **The 23MB `backend/scripts/seed/media/` only needs to be in the
  archive for this first seeding deploy** — trim it from later archives to keep them lean
  (the guard means re-runs are a no-op anyway; the images live in `UPLOAD_DIR` after).

---

## 7. Gotchas (all learned the hard way on `.nl`)

1. **LiteSpeed loads the entry with `require()`**, which can't load ESM-with-top-level-
   await → `ERR_REQUIRE_ASYNC_MODULE`, surfaced as a **503**. Fixed by the CommonJS shim
   `server.cjs` that `import()`s the ESM app. Keep `server.cjs` as the entry.
2. **Passenger doesn't set the working directory to the app root**, so `import 'dotenv/config'`
   (relative to cwd) finds no `.env` and the app exits on "Invalid environment" → 503.
   `boot.mjs` loads `.env` by **absolute path** — keep that.
3. **Backslash ZIPs** (Windows `Compress-Archive`) break the content-collection glob → all
   legal pages + blog 404 on a green build. Ship **forward-slash zips** (§4).
4. **Node 20** fails the build (`ERR_REQUIRE_CYCLE_MODULE` from `sanitize-html`). Pin **22**.
5. **DNSSEC**: if `.net`'s DNS has a stale DS record at the registrar, every validating
   resolver returns SERVFAIL and the site is unreachable even with a correct A record.
   Check `curl 'https://dns.google/resolve?name=cyberclaims.net&type=A'` — a `Status: 2`
   with a DNSSEC comment means fix/disable DNSSEC at the registrar.

---

## 8. DNS

Point `cyberclaims.net` (and `www`) at the Hostinger server IP **`82.198.228.29`** (same
shared IP as the other addon domains on this account):

- `A  cyberclaims.net      → 82.198.228.29`
- `A  www.cyberclaims.net  → 82.198.228.29` (or `CNAME www → cyberclaims.net`)
- Remove any `AAAA` unless the account has IPv6 (it doesn't — leaving old AAAA sends IPv6
  visitors elsewhere).
- Leave MX/SPF/DKIM/DMARC as they are unless you're also moving email.

`cyberclaims.net` currently sits behind Cloudflare (it resolves to a Cloudflare IP). If you
keep Cloudflare in front, set the A record there and set `TRUST_PROXY` to match the number
of proxies; otherwise point DNS straight at `82.198.228.29`. After DNS resolves, Hostinger
issues Let's Encrypt automatically (or use Cloudflare's edge cert).

---

## 9. Go-live verification

```bash
# health + pages
curl -s https://cyberclaims.net/api/health            # {"ok":true}
curl -sI https://cyberclaims.net/                     # 200, and NO "X-Robots-Tag: noindex"

# indexing is ON
curl -s https://cyberclaims.net/robots.txt            # "Allow: /" + Sitemap: …/sitemap.xml
curl -s https://cyberclaims.net/ | grep -c 'noindex'  # 0

# canonical host: www 301s to non-www (the app does this itself, domain-agnostic)
curl -sI https://www.cyberclaims.net/ | grep -iE 'HTTP|location'   # 301 -> https://cyberclaims.net/

# SEO / content
curl -s https://cyberclaims.net/sitemap.xml | grep -c '<loc>'          # ~230+ (pages×locales + 89 articles + phone-check)
curl -s https://cyberclaims.net/sitemap.xml | grep -c 'flash-loan'     # articles present (>0)
curl -s https://cyberclaims.net/sitemap.xml | grep -c 'phone-check'    # phone-check present (>0)
curl -s https://cyberclaims.net/news/ -o /dev/null -w '%{http_code}\n' # 200
```

Then in Google Search Console: add `cyberclaims.net`, submit `/sitemap.xml`, and (if the
staging `.nl` was ever exposed) confirm `.nl` is returning `noindex` so it doesn't compete
as duplicate content.

---

## 10. Checklist

- [ ] `.net` website + dedicated database exist.
- [ ] `.env`: `SITE_URL=https://cyberclaims.net`, **`ALLOW_INDEXING=true`**, `.net` DB,
      `.net` `UPLOAD_DIR`, fresh `JWT_SECRET` + `ADMIN_PASSWORD`, real Turnstile + SMTP.
- [ ] Built as a **forward-slash zip**, Node 22, entry `server.cjs`.
- [ ] Deployed; app restarted; `/api/health` ok.
- [ ] Articles seeded (cron, once) + admin password changed.
- [ ] DNS → `82.198.228.29`; SSL issued; DNSSEC not failing.
- [ ] `robots.txt` allows, no `noindex` header/meta, sitemap has articles + phone-check.
