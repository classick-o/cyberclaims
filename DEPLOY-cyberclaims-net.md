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
6. **Hostinger cron runs each command via `timeout <command>` — NOT through a shell.** So
   `;`, `|`, `&&`, `$(...)`, `>` redirects and `VAR=…` assignments are all treated as part of
   one bogus command name and fail with *"No such file or directory."* Each cron must be a
   **single executable + args**. For the article seed that means exactly:
   `/opt/alt/alt-nodejs22/root/bin/node /home/u399670331/domains/cyberclaims.net/nodejs/backend/scripts/seed-articles.js`
   (the running app lives in `…/cyberclaims.net/nodejs/`, not `.builds/`). The seed is
   idempotent — it prints *"Already seeded … Nothing to do."* on re-runs. Read a cron's
   result with the API's *get cron output* (it returns the last run's stdout/stderr; before
   the first run it just echoes the command). Command length is capped at **255 chars**.

---

## 8. DNS cutover — Option A (repoint the A record at Name.com)

The simplest, most reversible cutover: leave DNS where it is and change **one record**.
No nameserver move, no Cloudflare account of your own.

### 8.1 Current state (verified live)

| Fact | Value | Why it matters |
| --- | --- | --- |
| Registrar / DNS | **Name.com** (`ns1glr/ns2kqz/ns3ghw/ns4fpy.name.com`) | Records are edited **at Name.com** — not Hostinger, not Cloudflare |
| Current host | **Kinsta** (`x-kinsta-cache`, `ki-edge`, `ki-origin: g1p`) | The old WordPress site ("Home - Cyberclaims") lives on Kinsta |
| The Cloudflare in front | Real, but it's **Kinsta's** Cloudflare Enterprise (`server: cloudflare`, `cf-ray`) | You have **no login** to it — you can't set SSL mode or swap origin there. It vanishes the moment you repoint DNS |
| A record (`@`) | `162.159.135.42` (Kinsta's Cloudflare IP), **TTL 300** | Repointing this *is* the cutover; 5-min TTL = fast propagate **and** fast rollback |
| `www` | **CNAME → cyberclaims.net** | Repoint the apex and www follows; the app 301s www→non-www anyway |
| AAAA | **none** | Good — Hostinger has no IPv6, so there's no stale AAAA to strand v6 visitors |
| MX | Google Workspace (5 records) | **Leave untouched** — email must keep flowing |
| DNSSEC | **none** on `.net` | No DS-mismatch trap (that's what took `.nl` offline once) |
| `.net` vhost | exists on account `u399670331`, **no app deployed yet** | §4–6 must run before any DNS change |

### 8.2 What Option A is (and isn't)

You keep DNS at **Name.com** and repoint the `A` record from Kinsta to Hostinger. You are
**not** keeping Cloudflare (the Cloudflare in front today is Kinsta's, not yours) and you are
**not** moving nameservers.

**Do not switch nameservers to Hostinger.** You'd have to hand-recreate every record — 5×
Google MX, SPF, DKIM, DMARC, any subdomain — and one miss **silently kills email**;
propagation and rollback both become hours instead of minutes. Editing the single A record
at Name.com applies in minutes, undoes in seconds, and leaves email untouched.

The one thing to manage is SSL (§8.3): leaving Kinsta's Cloudflare means leaving its edge
certificate, so Hostinger must have a valid cert of its own the instant traffic arrives.

### 8.3 SSL — the only real risk, and how to remove it

Hostinger auto-issues Let's Encrypt by **HTTP-01**, which can only validate **after** the
domain points at Hostinger. So "flip DNS then wait" leaves a few-minutes window of browser
cert warnings — that window is the "downtime" people hit on this kind of move. Pick one:

**Simple (small window).** Flip DNS, then immediately go **hPanel → cyberclaims.net → SSL →
install / force**. Hostinger validates over HTTP-01 within a few minutes and the warning
clears. TTL is 300, so it's brief — fine for a low-traffic window.

**Zero SSL gap (pre-issue — still simple).** Issue the cert **before** touching DNS using
**DNS-01** (which doesn't need the domain pointed yet), then upload it to Hostinger:

```bash
certbot certonly --manual --preferred-challenges dns \
  -d cyberclaims.net -d www.cyberclaims.net
# add the two _acme-challenge TXT records it prints, at Name.com; wait for propagation; continue
```

Upload the resulting `fullchain` + key in **hPanel → SSL → Install a custom SSL** for
cyberclaims.net. The cert is now live on Hostinger before any visitor arrives, so the flip
has **no gap at all**. Hostinger's own Let's Encrypt then takes over auto-renewal once
HTTP-01 works post-cutover.

> Never flip DNS and *then* start thinking about the cert — that ordering is the entire
> source of "SSL downtime" on this migration.

### 8.4 Cutover runbook

**T-48h — prepare (zero user impact; Kinsta still serves everything)**
- [ ] Production DB created (§2); `.env` filled (§3) with `SITE_URL=https://cyberclaims.net`
      and **`ALLOW_INDEXING=false` for now** (flip it at T+1h, §8.5).
- [ ] Deploy the app to the `.net` vhost (§4–5), restart, run migrations + `seed:admin` +
      `seed:articles` (§6).
- [ ] **Test before any DNS change** by overriding DNS to the **origin server IP**. ⚠️ Use
      the origin `82.198.228.29` (the account's stable server IP — the same one
      `tbsbv.com` resolves to). Do **not** use whatever `cyberclaims.nl` resolves to: that
      returns Hostinger's rotating `hcdn` edge IPs (`92.113.x`), and the edge serves a
      **"Parked Domain" placeholder** for any domain whose DNS doesn't yet point at Hostinger.
      Only the origin serves the real app by `Host` header pre-cutover. HTTPS will warn until
      the cert is issued, so test over HTTP (or `-k`):
      ```bash
      IP=82.198.228.29
      curl -s  --resolve cyberclaims.net:80:$IP  http://cyberclaims.net/api/health   # {"ok":true}
      curl -s  --resolve cyberclaims.net:80:$IP  http://cyberclaims.net/ -o /dev/null -w '%{http_code}\n'
      ```
      (or add `82.198.228.29 cyberclaims.net` to your hosts file and click through the site).
      Verify: homepage, an article, `/services/…`, `/who-called-me-uk/`, `/admin` login, a
      test lead, and the phone-report PDF.
- [ ] (Zero-gap path) Pre-issue + upload the SSL cert per §8.3.
- [ ] Confirm the A-record TTL at Name.com is ≤300s (it is).

**T-0 — the switch (seconds of work, at Name.com)**
- [ ] Target IP = **`82.198.228.29`** — the account's **stable origin** server IP (the one
      `tbsbv.com` resolves to, TTL 4h). ⚠️ Do **not** use the `92.113.x` addresses that
      `cyberclaims.nl` resolves to — those are Hostinger's rotating `hcdn` edge IPs (they
      change and, for a not-yet-pointed domain, serve a parked page). Confirm the value in
      **hPanel → Websites → cyberclaims.net → Website IP / DNS** before changing it.
- [ ] At **Name.com → Domains → cyberclaims.net → DNS Records**, change the **A record**
      (`@`) from `162.159.135.42` to **`82.198.228.29`**.
- [ ] Leave **www** as its **CNAME → cyberclaims.net** (it follows the apex; the app 301s
      www→non-www itself).
- [ ] Do **not** add an `AAAA` record — the Hostinger account has **no IPv6**.
- [ ] **Do not touch MX / SPF / DKIM / DMARC.** Email keeps flowing.
- [ ] If you took the simple SSL path, force SSL install in hPanel now (§8.3).
- [ ] **Leave the Kinsta site running** — it is your rollback.

**T+5min — verify**
- [ ] Run the §9 checks against the real domain (no `--resolve`).
- [ ] Confirm HTTPS now serves a **Hostinger / Let's Encrypt** cert (not `server: cloudflare`)
      and that `www` 301s to non-www; check old URLs still resolve (§8.6).

**T+1h — turn on indexing (only once you're happy)**
- [ ] Set `ALLOW_INDEXING=true`, **rebuild and redeploy** (the robots `<meta>` is baked at
      build time — see §3), restart.
- [ ] Confirm `/robots.txt` allows and no `noindex` remains (§9).
- [ ] Submit `/sitemap.xml` in Google Search Console.

### 8.5 Rollback (any time, ~5 minutes)

At Name.com, set the A record back to `162.159.135.42` (Kinsta). TTL 300s means visitors
return to the Kinsta/WordPress site within minutes. The DB, email and nameservers were never
touched — that reversibility is the whole point of Option A.

### 8.6 URL continuity (don't lose the rankings you're migrating)

The new site already preserves the important shapes:

- **Articles** keep their exact WordPress slugs at the root (`/<slug>/`).
- **`/service/<slug>/` → `/services/<slug>/`** is 301'd in `backend/server.js`.
- **`/news/<slug>/` → `/<slug>/`** is 301'd.
- **`www` → non-www** is 301'd, so a page never exists at two URLs.
- The Google Ads landing pages keep their original slugs.

Before cutover, crawl the old site (Screaming Frog) and check every 200-URL still resolves
on the new one; add a 301 for anything that doesn't. **A missed redirect is the real SEO
risk of this migration — far more than the switch itself.**

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
- [ ] SSL pre-issued/uploaded to Hostinger (or ready to force-install at cutover) — §8.3.
- [ ] **A record at Name.com** repointed from `162.159.135.42` (Kinsta) → the Hostinger IP
      read from hPanel; `www` left as CNAME → apex; MX/SPF/DKIM/DMARC untouched.
- [ ] HTTPS serves a Hostinger/Let's Encrypt cert (not `server: cloudflare`); DNSSEC not failing.
- [ ] `robots.txt` allows, no `noindex` header/meta, sitemap has articles + phone-check.
