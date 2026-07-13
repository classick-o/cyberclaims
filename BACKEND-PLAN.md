# Cyberclaims — Plan Backend + CMS + i18n

> Propunere de arhitectură. Punct de plecare: backendul TBSBV (`D:\Proiecte\TBSBV\backend`).
>
> **Decizii luate:** SSR (site-ul pleacă de pe GitHub Pages) · admin custom (fără Directus) ·
> infrastructură i18n construită acum, lista de limbi decisă mai târziu.

---

## 1. De unde plecăm

### Ce e TBSBV (și ce NU e)

TBSBV **nu are un backend de aplicație**. Are un micro-API Express (12 fișiere, ~10 KB) cu o singură
funcție: primește lead-uri din formularul de contact → le scrie într-o tabelă MySQL → trimite 2 emailuri.

```
server.js → src/app.js → routes/ → middleware/ → models/ | services/
```

Ce **există** și copiem 1:1:

| Pattern | De ce |
|---|---|
| Layering Express (`server → app → routes → middleware → models/services`) | Curat, previzibil, ușor de extins |
| `mysql2/promise` cu pool + prepared statements | Fără ORM, fără magie. Se potrivește cu echipa |
| Emailuri **fire-and-forget** | Dacă SMTP pică, lead-ul tot se salvează și userul tot primește 201 |
| Transporter cu degradare grațioasă (`if (!transporter) return`) | Aplicația pornește și fără SMTP configurat |
| Contract de erori `{ success: false, errors: [{ field, message }] }` | Simplu, consumabil direct de UI |
| Honeypot cu **200 fals** | Botul crede că a reușit și nu retry-uiește |
| `app.set('trust proxy', …)` | Obligatoriu pentru `req.ip` corect în spatele unui proxy |
| SEO din `[slug].astro` (JSON-LD `Article` + `BreadcrumbList`, `wordCount`) | Partea cea mai bună din TBSBV |

Ce **nu există** în TBSBV și construim de la zero:

- ❌ autentificare / roluri / conturi
- ❌ admin / CMS (conținutul e cod: `src/data/insights.ts`, 392 linii, HTML brut în template literals)
- ❌ upload-uri de fișiere
- ❌ i18n (site monolingv EN, `<html lang="en">` hardcodat)
- ❌ migrations (`schema.sql` se rulează cu mâna)
- ❌ CI/CD pe backend (deploy = urci `server.zip` pe Hostinger, manual)

### Ce e Cyberclaims azi

Astro 5 SSG + Tailwind v4, pe GitHub Pages, **fără adaptor** → nu poate rula cod pe server.

Trei lucruri sunt **rupte în producție** și planul le repară:

1. **Formularele nu funcționează.** Hero (`src/components/Hero.astro:50`) și Contact
   (`src/pages/contact-us.astro:96`) postează spre `action="/api/lead"` — endpoint care **nu există**.
   Wizard-ul Start Process (`src/pages/start-process.astro:497`) face `preventDefault()` și afișează un
   mesaj **fals** de succes („we'll respond within 24-72 business hours"), fără să trimită nimic nicăieri.
   **Lead-uri pierdute, cu confirmare mincinoasă către victime de fraudă.**
2. **Blogul e o fantomă.** `/news/` listează 3 carduri hardcodate în `src/data/site.ts` care linkuiesc
   spre `/news/<slug>/` — **toate 404**. Nu există `src/pages/news/[slug].astro`.
3. **CAPTCHA inexistent.** Toate formularele afișează „Protected by CAPTCHA". Nu e nimic acolo.

Două lucruri bune, pe care ne bazăm:
- **Toate linkurile interne trec prin `link()`** (`src/lib/paths.ts`) → choke-point unic pentru locale.
- **`ServiceBlock`** (`src/data/services-content.ts:19-34`) e deja un union discriminat block-based —
  practic o schemă de CMS scrisă de mână. Se traduce fără schimbare de formă.

---

## 2. Arhitectura: **un singur proces Node**

Pentru că mergem pe SSR și plecăm de pe GitHub Pages, alegerea evidentă e ca **Express să fie serverul, iar
Astro să ruleze în interiorul lui** ca middleware (`@astrojs/node` în `mode: 'middleware'`).

```
                      ┌─────────────── Cloudflare (free) ───────────────┐
   internet  ────────►│  CDN cache · Turnstile · WAF · TLS · DDoS       │
                      └───────────────────────┬─────────────────────────┘
                                              │
                              ┌───────────────▼──────────────────────────┐
                              │  UN SINGUR PROCES NODE (VPS, PM2)        │
                              │                                          │
                              │  Express                                 │
                              │   ├── /api/public/*   lead, newsletter   │
                              │   ├── /api/admin/*    JWT cookie         │
                              │   ├── /admin          SPA (React)        │
                              │   ├── /uploads        media (disk)       │
                              │   ├── /_astro         assets statice     │
                              │   └── (tot restul) ──► Astro SSR handler │
                              │                          ├─ prerender    │
                              │                          └─ SSR: /news/* │
                              └───────────────┬──────────────────────────┘
                                              │
                                   ┌──────────▼──────────┐
                                   │  MySQL  +  /uploads │
                                   └─────────────────────┘
```

De ce un singur proces, nu două:

- **Formularele merg exact așa cum sunt scrise.** `action="/api/lead"` e same-origin → zero CORS, zero URL
  hardcodat cross-domain (greșeala din TBSBV: `https://www.app.tbsbv.com/api/leads` scris direct în
  `Contact.astro`).
- **Cookie-ul de admin e same-origin** → `HttpOnly; Secure; SameSite=Lax`, fără gimnastică `SameSite=None`.
- **Un deploy, un `.env`, un log.** Conținutul vine din DB la runtime, deci un „deploy" e doar o schimbare
  de cod — cuplarea site ↔ API nu costă nimic.
- Hostingul Node partajat de la Hostinger oricum îți dă **o singură aplicație per domeniu**; două procese ar
  cere reverse-proxy pe care nu-l controlezi.

```js
// server.js  —  Express găzduiește, Astro e ultimul middleware
import express from 'express';
import { handler as astro } from './site/dist/server/entry.mjs';   // mode: 'middleware'

const app = express();
app.set('trust proxy', 1);                       // Cloudflare = 1 proxy
app.use(helmet());
app.use('/api', apiRouter);                      // leads, newsletter, admin
app.use('/uploads', express.static('uploads', { maxAge: '1y', immutable: true }));
app.use('/admin', express.static('admin/dist'), adminSpaFallback);
app.use(express.static('site/dist/client'));     // JS/CSS/imagini Astro
app.use(astro);                                  // ← tot restul: prerender + SSR
app.listen(process.env.PORT);
```

> ⚠️ Astro emite **ESM**. Backendul TBSBV e CommonJS. Fă backendul ESM (`"type": "module"`) — e o divergență
> conștientă față de TBSBV și oricum e direcția corectă.

### Astro: hibrid, nu SSR peste tot

În Astro 5, `output: 'static'` + adaptor = **hibrid**: paginile sunt prerandate implicit, iar cele marcate
`export const prerender = false` se randează la request. Exact ce vrem:

```js
// astro.config.mjs
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://www.cyberclaims.net',
  output: 'static',                              // implicit; adaptorul îl face hibrid
  adapter: node({ mode: 'middleware' }),
  i18n: { locales: LOCALES, defaultLocale: 'en', routing: { prefixDefaultLocale: false } },
  vite: { plugins: [tailwindcss()] },
});
```

| Rută | Mod | De ce |
|---|---|---|
| `/`, `/about-us/`, `/services/*`, paginile legale | **prerender** (implicit) | Nu se schimbă între deploy-uri. HTML servit de pe disc, zero query. |
| `/news/`, `/news/[slug]/` | `prerender = false` | Vin din DB. Publish instant. |
| `/api/*` | Express, nu Astro | Ținem API-ul în Express, ca la TBSBV. |

**95% din site rămâne HTML pe disc.** SSR-ul îl plătim doar acolo unde ne cumpără ceva.

### Cache: performanță de site static, cu publish instant

Randarea SSR a blogului la fiecare request ar însemna un query MySQL per vizitator. Rezolvăm pe două nivele:

1. **LRU în proces** pe rezultatele din DB, invalidat la publish/unpublish. ~40 de linii.
2. **Cloudflare** în față + headere pe rutele de blog:
   `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`
   La publish, backendul face **purge selectiv** prin API-ul Cloudflare → live în câteva secunde.

Rezultat: paginile de blog sunt servite din CDN ca și cum ar fi statice, dar publish-ul e instant.
Bonus, Cloudflare-ul gratuit aduce și **Turnstile** (CAPTCHA-ul de care avem oricum nevoie), WAF și
protecție DDoS — argument real pentru un client care e firmă de securitate.

> Cu Cloudflare în față, IP-ul real vine din `CF-Connecting-IP`. `trust proxy` trebuie setat pe **numărul**
> de proxy-uri (`1`), **nu** pe `true` — altfel `X-Forwarded-For` e spoofabil și rate-limitingul devine decorativ.

---

## 3. Backend

### Stack

Ca TBSBV, plus strictul necesar. **Fără ORM, fără TypeScript pe backend** — păstrăm stilul existent.

```json
{
  "type": "module",
  "dependencies": {
    "express": "^4.21.2",
    "mysql2": "^3.12.0",
    "nodemailer": "^6.10.0",
    "dotenv": "^16.4.7",
    "express-rate-limit": "^7.5.0",
    "@astrojs/node": "^9.0.0",     // ← nou: Astro ca middleware
    "helmet": "^8.0.0",            // ← nou: headere de securitate
    "zod": "^3.24.0",              // ← nou: validare (înlocuiește validarea hand-rolled)
    "bcrypt": "^5.1.1",            // ← nou: parole admin
    "jsonwebtoken": "^9.0.2",      // ← nou: sesiune admin
    "cookie-parser": "^1.4.7",
    "multer": "^1.4.5-lts.1",      // ← nou: upload
    "sharp": "^0.33.5",            // ← nou: resize + webp + re-encodare
    "sanitize-html": "^2.14.0",    // ← nou: curăță HTML-ul din editor
    "file-type": "^19.0.0"         // ← nou: sniff MIME real, nu extensia
  }
}
```

Notă: `cors` **dispare** din dependențe. Nu mai avem cross-origin.

### Structură

```
/                                # un repo, un deploy
├── server.js                    # Express + Astro middleware (vezi §2)
├── site/                        # ← proiectul Astro actual, mutat aici
│   ├── astro.config.mjs
│   └── src/…
├── admin/                       # SPA React (Vite) → build în admin/dist
├── migrations/
│   ├── 001_leads.sql  002_auth.sql  003_blog.sql  004_media.sql  005_newsletter.sql
├── scripts/
│   ├── migrate.js               # ~30 linii: rulează migrations/*.sql în ordine, evidență în _migrations
│   └── seed-admin.js            # creează primul cont
├── uploads/                      # media (gitignored, backupat separat)
└── src/                          # backendul propriu-zis
    ├── app.js
    ├── config/
    │   ├── database.js          # pool mysql2 (copiat 1:1 din TBSBV)
    │   └── env.js               # NOU: validează env cu zod la boot → crapă la pornire, nu în producție
    ├── middleware/
    │   ├── auth.js              # requireAuth, requireRole, csrf
    │   ├── validate.js          # validate(zodSchema) — generic
    │   ├── upload.js            # multer + file-type + sharp
    │   ├── rateLimiter.js
    │   └── errorHandler.js
    ├── models/                  # clase cu metode statice, SQL brut (stil TBSBV)
    │   └── Admin.js  Lead.js  Post.js  Category.js  Author.js  Media.js  Subscriber.js
    ├── routes/
    │   ├── public/   leads.js  newsletter.js  health.js
    │   └── admin/    auth.js  posts.js  media.js  categories.js  authors.js  leads.js  subscribers.js
    ├── schemas/      lead.schema.js  post.schema.js  auth.schema.js
    └── services/
        ├── emailService.js      # nodemailer (copiat din TBSBV + escaping)
        ├── contentCache.js      # LRU + invalidare la publish
        ├── cloudflare.js        # purge selectiv
        ├── turnstile.js         # verificare CAPTCHA
        └── sanitize.js
```

Astro citește conținutul **direct din model** (`Post.findPublished(locale)`), nu prin HTTP — sunt în același
proces. Fără fetch, fără serializare, fără endpoint public de conținut. Un strat mai puțin.

### Schema DB

Modelul de i18n: **entitatea e locale-independentă, traducerile sunt rânduri separate.** E pattern-ul
standard (îl folosesc și Directus/Strapi) și scalează la N limbi fără nicio schimbare de schemă — motiv
pentru care îl punem de la prima migrație, chiar dacă pornim doar cu engleză.

```sql
-- ─── Auth ────────────────────────────────────────────────────────────────
CREATE TABLE admins (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  name           VARCHAR(255) NOT NULL,
  role           ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  totp_secret    VARCHAR(64) DEFAULT NULL,     -- 2FA opțional (firmă de securitate → merită)
  last_login_at  TIMESTAMP NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Blog ────────────────────────────────────────────────────────────────
CREATE TABLE authors (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  role       VARCHAR(255),                     -- "Head of Blockchain Forensics"
  avatar_id  INT UNSIGNED,
  bio        TEXT
);

CREATE TABLE categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  key_slug    VARCHAR(100) NOT NULL UNIQUE,    -- ID STABIL, nu se traduce: 'crypto-recovery'
  color       VARCHAR(20),
  sort_order  INT DEFAULT 0
);

CREATE TABLE category_translations (
  category_id  INT UNSIGNED NOT NULL,
  locale       VARCHAR(5)   NOT NULL,
  name         VARCHAR(255) NOT NULL,          -- "Crypto Recovery" / "Cryptoherstel"
  slug         VARCHAR(255) NOT NULL,          -- segment URL per limbă
  PRIMARY KEY (category_id, locale),
  UNIQUE KEY uq_cat_locale_slug (locale, slug),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE posts (                            -- entitatea, fără text
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id    INT UNSIGNED,
  author_id      INT UNSIGNED,
  cover_media_id INT UNSIGNED,
  featured       TINYINT(1) NOT NULL DEFAULT 0, -- brief §4: "featured hero card"
  status         ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  published_at   DATETIME NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_pub (status, published_at),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE post_translations (                -- un rând per limbă
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id          INT UNSIGNED NOT NULL,
  locale           VARCHAR(5)   NOT NULL,
  slug             VARCHAR(255) NOT NULL,       -- slug propriu per limbă (SEO pe cuvinte-cheie locale)
  title            VARCHAR(255) NOT NULL,
  excerpt          TEXT,
  body_html        MEDIUMTEXT NOT NULL,         -- sanitizat LA SALVARE (vezi §6)
  seo_title        VARCHAR(255),
  seo_description  VARCHAR(320),
  keywords         JSON,                        -- pentru JSON-LD (ca la TBSBV)
  reading_minutes  SMALLINT UNSIGNED,           -- calculat la save, nu la render
  UNIQUE KEY uq_post_locale  (post_id, locale),
  UNIQUE KEY uq_locale_slug  (locale, slug),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- ─── Media ───────────────────────────────────────────────────────────────
CREATE TABLE media (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  filename   VARCHAR(255) NOT NULL,
  path       VARCHAR(500) NOT NULL,             -- /uploads/2026/07/a1b2c3.webp
  variants   JSON,                              -- {"480":"…-480.webp","960":"…","1600":"…"} → srcset
  mime       VARCHAR(100),
  width      INT, height INT, bytes INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE media_translations (               -- alt-text per limbă (a11y + SEO)
  media_id INT UNSIGNED NOT NULL,
  locale   VARCHAR(5) NOT NULL,
  alt      VARCHAR(500),
  PRIMARY KEY (media_id, locale),
  FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);

-- ─── Lead-uri (TBSBV extins pentru wizard-ul Start Process) ──────────────
CREATE TABLE leads (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(255) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  phone_code        VARCHAR(10),
  phone             VARCHAR(50),
  country           VARCHAR(100),
  message           TEXT,
  -- câmpuri Start Process:
  amount_lost       VARCHAR(50),                -- cele 6 praguri din radio
  platform_name     VARCHAR(255),
  platform_website  VARCHAR(500),
  first_transaction DATE,
  last_transaction  DATE,
  --
  source            ENUM('hero','contact','start_process','url_checker') NOT NULL,
  locale            VARCHAR(5) DEFAULT 'en',
  ip_address        VARCHAR(45),
  user_agent        TEXT,
  status            ENUM('new','contacted','qualified','closed') NOT NULL DEFAULT 'new',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status), INDEX idx_created (created_at), INDEX idx_source (source)
);

-- ─── Newsletter (brief §4 îl cere explicit) ──────────────────────────────
CREATE TABLE newsletter_subscribers (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  locale        VARCHAR(5) DEFAULT 'en',
  status        ENUM('pending','confirmed','unsubscribed') NOT NULL DEFAULT 'pending',
  token         VARCHAR(64) NOT NULL,           -- confirm + unsubscribe
  confirmed_at  TIMESTAMP NULL,
  ip_address    VARCHAR(45),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> **MariaDB:** dacă Hostinger rulează MariaDB, `JSON` e alias pentru `LONGTEXT` — merge, dar fără funcțiile
> `JSON_*`. Nu ne deranjează: citim/scriem cu `JSON.parse/stringify` în model.

> **Diferență față de TBSBV:** la ei, coloana `status` de pe `leads` există dar **nimic din cod nu o poate
> modifica** — lead-urile se gestionează manual din phpMyAdmin. La noi, editorul o schimbă din UI.

### Endpoints

**Public — fără auth**

| Metodă | Rută | Note |
|---|---|---|
| `POST` | `/api/lead` | **Toate cele 3 formulare** — ruta pe care markup-ul o cheamă deja. Discriminat pe `source`. Rate limit 5/15min + honeypot + Turnstile |
| `POST` | `/api/newsletter` | Double opt-in (obligatoriu GDPR în NL) |
| `GET`  | `/api/newsletter/confirm?token=` · `/unsubscribe?token=` | |
| `POST` | `/api/url-check` | **Fază 2** — vezi §9 |
| `GET`  | `/api/health` | Doar `{ ok: true }`. **Nimic altceva** (vezi §6) |

Nu există endpoint public de conținut: Astro citește din model, în proces.

**Admin — JWT în cookie `HttpOnly` + token CSRF pe mutații**

| Metodă | Rută |
|---|---|
| `POST` | `/api/admin/auth/login` · `/logout` · `GET /me` |
| `GET POST PATCH DELETE` | `/api/admin/posts` · `POST /api/admin/posts/:id/publish` (→ invalidează cache + purge CF) |
| `POST GET DELETE` | `/api/admin/media` (multipart → sniff → sharp → webp ×3 lățimi) |
| `GET POST PATCH DELETE` | `/api/admin/categories` · `/api/admin/authors` |
| `GET` | `/api/admin/leads` (filtre + paginare) · `PATCH /:id` (status) · `DELETE /:id` (GDPR) · `GET /export.csv` |
| `GET` | `/api/admin/subscribers` · `/export.csv` |
| `POST` | `/api/admin/translate` — **opțional**: draft în altă limbă prin Claude API |

Păstrăm contractul de erori din TBSBV: `400 → { success: false, errors: [{ field, message }] }`.

---

## 4. Adminul

SPA (Vite + React), buildat în `admin/dist`, servit de Express la `/admin`. Aceeași origine ca tot restul.

1. **Login** — email + parolă (+ TOTP opțional), rate-limited.
2. **Posts — listă** — filtre pe status/categorie/limbă, badge „lipsește traducerea X", toggle featured.
3. **Post — editor** (ecranul care contează):
   - **Tab-uri per limbă** pe câmpurile traductibile (title, slug, excerpt, body, SEO).
     Cu o singură limbă activă, tab-urile pur și simplu nu apar — UI-ul e deja pregătit pentru a doua.
   - Câmpurile comune (categorie, autor, cover, featured, dată) stau **în afara tab-urilor** — se setează o dată.
   - **WYSIWYG (Tiptap)** → HTML, sanitizat server-side. Markdown e mai portabil, dar pentru un editor
     non-tehnic (Julia, COO) WYSIWYG-ul e alegerea corectă.
   - **Preview pe site-ul real**: `/news/<slug>?preview=<token-semnat>` → SSR randează draftul cu CSS-ul real.
     Ăsta e cadoul pe care ni-l face SSR-ul; în varianta statică ar fi trebuit reconstruit stilul în admin.
   - Opțional: buton **„Traduce din EN"** → pre-completează prin Claude API, pentru revizuire umană.
4. **Media library** — grid, upload drag&drop, alt-text per limbă, copiere URL.
5. **Categorii / Autori** — CRUD simplu.
6. **Leads** — tabel cu filtre, schimbare status (`new → contacted → qualified → closed`), export CSV,
   **ștergere** (dreptul la ștergere, GDPR). Exact ce TBSBV n-a construit niciodată.
7. **Newsletter** — listă abonați, export CSV.

---

## 5. i18n

### Ce se traduce și unde stă

Două tipuri de conținut traductibil, cu soluții **diferite**:

| | Unde stă | De ce |
|---|---|---|
| **A. Copy static** (nav, butoane, hero, servicii, pagini legale) | **Dicționare în repo** (`site/src/i18n/`) | Se schimbă rar, e versionat cu codul, **type-safe**, zero cost la runtime, nu are nevoie de admin |
| **B. Blog + categorii + alt-text** | **DB** (`post_translations` etc.) | Se schimbă des, editat de non-dev |

**Nu băga copy-ul static în DB.** Sunt ~10.000 de linii de string-uri; ar însemna un al doilea admin de
construit și întreținut, pentru conținut care se schimbă o dată pe an. Dacă clientul cere mai târziu să-și
editeze singur copy-ul, se adaugă o tabelă `ui_strings` care face override peste dicționare — dar **nu acum**.

### Strategia de livrare: plumbing acum, limbi mai târziu

Livrăm cu `LOCALES = ['en']`. Site-ul arată și se comportă **identic cu azi** — nicio rută nouă, nicio
schimbare vizibilă. Ce se schimbă e doar structura pe dedesubt:

- rutele trec prin `[...lang]` (care, cu o singură limbă, generează exact aceleași URL-uri);
- copy-ul iese din markup în dicționare;
- DB-ul are deja `*_translations`.

Când vine a doua limbă: **adaugi un string în `LOCALES` și un fișier de dicționar.** Atât.

Motivul pentru care facem plumbing-ul acum: retrofit-ul de i18n peste 10k linii de copy hardcodat e scump
și riscant. Instalația e ieftină acum, cât timp oricum umblăm prin cod.

### Strategia de URL

```
/                    → EN  (default, NEPREFIXAT)
/nl/                 → a doua limbă, când vine
/about-us/           /nl/about-us/            ← același slug pe paginile statice
/news/<slug-en>/     /nl/news/<slug-nl>/      ← slug propriu pe limbă DOAR la blog (SEO local)
```

`prefixDefaultLocale: false` → **toate URL-urile engleze existente rămân neschimbate.** Merită spus explicit
clientului: brief-ul cere „keep … all copy and page URLs", iar un site multilingv sună ca o încălcare a
scope-ului. Nu e — engleza rămâne exact unde e.

### Rute: o singură copie a fiecărei pagini

Trucul e **rest-param-ul `[...lang]`**, care matchuiește și zero segmente. Nu duplicăm fișiere de pagină.

```
site/src/pages/
└── [...lang]/
    ├── index.astro                 → /            (+ /nl/ când adăugăm limba)
    ├── about-us.astro              → /about-us/   (+ /nl/about-us/)
    ├── contact-us.astro  start-process.astro  url-checker.astro
    ├── services/
    │   ├── index.astro
    │   └── [service].astro         → produsul cartezian locale × servicii
    ├── news/
    │   ├── index.astro             ← prerender = false
    │   └── [slug].astro            ← prerender = false. NOU (azi lipsește → 404-uri în producție)
    └── [legal].astro               ← cookie/privacy/terms/dpa din Content Collections
```

```ts
// pattern comun pe paginile prerandate
export function getStaticPaths() {
  return LOCALES.map((locale) => ({
    params: { lang: locale === DEFAULT_LOCALE ? undefined : locale },  // undefined → fără prefix
    props: { locale },
  }));
}
```

Rutele de blog fiind SSR, **nu au deloc `getStaticPaths`** — citesc `Astro.params` la request. Mai simplu.

### Dicționare type-safe

Cheia întregii scheme: **o traducere lipsă = eroare de compilare**, nu un string gol în producție.

```ts
// site/src/i18n/en.ts
export const en = {
  'nav.about':   'About Us',
  'hero.title':  'Recover What Was Taken From You',
  'form.submit': 'Start Free Case Review',
  // …
} as const;

// site/src/i18n/nl.ts   ← când vine a doua limbă
import type { en } from './en';
export const nl: Record<keyof typeof en, string> = {   // ← lipsește o cheie → tsc pică
  'nav.about':   'Over Ons',
  'hero.title':  'Herstel Wat Van U Is Afgenomen',
  'form.submit': 'Start Gratis Zaakbeoordeling',
};
```

Pentru date **structurate** (`SERVICES`, `SERVICE_CONTENT`, `TESTIMONIALS`, `PRESS`), cheile plate sunt
nepractice. Acolo mergem pe module cheiate pe locale:

```ts
export const SERVICE_CONTENT: Record<Locale, Record<string, ServicePage>> = {
  en: { '/cryptocurrency-tracing/': { … } },
};
```

### `link()` devine locale-aware

Toate linkurile interne trec deja prin `link()` — deci rutarea i18n e **o singură modificare**:

```ts
// site/src/lib/paths.ts
export function link(path: string, locale: Locale = DEFAULT_LOCALE): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return `${prefix}${path.startsWith('/') ? path : `/${path}`}`;
}
```

(Logica de `BASE_PATH` pentru sub-path-ul GitHub Pages dispare odată cu GitHub Pages.)

### 🔴 Trei bug-uri de reparat ÎNAINTE de a traduce ceva

1. **`BENTO_IMG` e cheiat pe text englezesc de afișare** (`src/pages/services/[service].astro:42-53`):
   ```ts
   const BENTO_IMG: Record<string, string> = {
     'Cluster Analysis': '/bento/cluster-analysis.webp',   // ← traduci term-ul → maparea se rupe în TĂCERE
     'Attribution Data': '/bento/attribution-data.webp',
   };
   ```
   **Fix:** `id` stabil pe fiecare `defs.item`, cheiere pe el.
2. **Locale hardcodat la numere** — `src/components/Sustainability.astro:131`: `n.toLocaleString('en-US', …)`.
3. **Date ca string-uri englezești** — `src/data/site.ts:214`: `date: 'July 2, 2026'`.
   **Fix:** stochează ISO (`'2026-07-02'`), formatează cu `Intl.DateTimeFormat(locale)`.

### Meta i18n în `Layout.astro`

```astro
<html lang={locale}>
  <link rel="canonical" href={absUrl(path, locale)} />
  {LOCALES.map((l) => <link rel="alternate" hreflang={l} href={absUrl(path, l)} />)}
  <link rel="alternate" hreflang="x-default" href={absUrl(path, DEFAULT_LOCALE)} />
  <meta property="og:locale" content={OG_LOCALE[locale]} />
```

Cu o singură limbă, blocul e inert. Plus `@astrojs/sitemap` cu cheia `i18n` (nu e instalat încă).

### Când vine a doua limbă

- **Articolele fără traducere nu apar** în listingul limbii respective și nu generează rută.
  Alternativa (fallback pe EN cu notiță) creează duplicate-content și UX pe jumătate.
- **Producerea traducerilor:** extragi EN în dicționare (munca grea, se face oricum) → `scripts/i18n-fill.js`
  completează cheile lipsă prin DeepL/Claude → **revizuire umană de un vorbitor nativ** → `tsc` garantează
  că nu rămâne nicio cheie negocitată.
- ⚠️ **Paginile legale (privacy, terms, DPA, cookies) NU se traduc automat.** Text juridic → validare de
  jurist per jurisdicție. De discutat cu clientul înainte de a promite ceva.

---

## 6. Securitate — ce reparăm față de TBSBV

TBSBV are patru probleme reale. Nu le replicăm.

| # | Problema în TBSBV | Fix |
|---|---|---|
| 1 | **`GET /api/health` scurge configul DB** — `DB_HOST`, `DB_USER`, `DB_NAME`, lungimea parolei **și primele 3 caractere din ea**. Comentariul zice „remove after DB is working" — a rămas în producție. | `/api/health` întoarce `{ ok: true }`. Punct. |
| 2 | **`backend/server.zip` e commit-uit în git și conține un `.env` real** cu credențiale DB + SMTP. `.gitignore` exclude `.env`, dar nu și zip-ul care-l conține. | Fără artefacte de build în git. Deploy prin CI cu secrets. **Separat: rotați ACUM credențialele TBSBV** — sunt în istoricul repo-ului. |
| 3 | **Injecție HTML în emailuri** — `emailService.js` interpolează inputul userului direct: `<td>${message}</td>`. | `escapeHtml()` pe toate câmpurile înainte de interpolare. |
| 4 | **Anti-spam slab** — doar honeypot + 5 req/15min. | Păstrăm ambele + **Cloudflare Turnstile**. UI-ul promite deja CAPTCHA — devine adevărat. |

Suprafață nouă (auth + upload-uri + SSR):

- `helmet` + CSP. Atenție: hero-ul 3D și scripturile inline din `.astro` cer `nonce`-uri în CSP.
- Parole `bcrypt` (cost 12). JWT în cookie `HttpOnly; Secure; SameSite=Lax`. Login rate-limited.
  **Fără signup public** — conturile se creează cu `seed-admin.js`.
- **CSRF:** same-origin înseamnă că `SameSite=Lax` blochează POST-urile cross-site, dar endpointul de upload
  e `multipart` (pe care un `<form>` cross-site îl poate trimite) → **double-submit CSRF token** pe toate
  mutațiile din admin.
- 2FA (TOTP) — opțional, dar clientul e **firmă de securitate cibernetică**. Ar fi jenant să fie spart.
- Upload: cap de mărime, **sniff MIME real** (`file-type`, nu extensia), **re-encodare prin `sharp`**
  (distruge orice payload embedded), nume random, `/uploads` fără drept de execuție.
- `sanitize-html` cu allowlist strict pe `body_html` **la salvare** (nu la render) — TBSBV injectează HTML
  brut din `insights.ts` cu `set:html`, fără nicio sanitizare.
- **GDPR:** lead-urile conțin PII sensibil (cât a pierdut omul, pe ce platformă, când). Necesare: politică de
  retenție + job de ștergere, endpoint de ștergere în admin, DPA (pagina există deja).

---

## 7. Deploy

**Infrastructura (de confirmat):** un **VPS** (Hetzner ~€5/lună, sau Hostinger VPS) + **Cloudflare gratuit**.
Hostingul Node partajat de la Hostinger ar merge, dar te limitează la o aplicație, fără control pe nginx și
cu spațiu de disc incert pentru `/uploads`. Pentru SSR + admin + media, un VPS mic e alegerea sănătoasă.

```
Cloudflare (DNS, TLS, CDN, Turnstile, WAF)
  └─► nginx (reverse proxy, gzip/brotli)
        └─► PM2 → node server.js   (Express + Astro)
              ├─► MySQL
              └─► /uploads (+ backup zilnic, offsite)
```

Pipeline (GitHub Actions → SSH):
```
npm ci → npm run build:site → npm run build:admin
      → node scripts/migrate.js → pm2 reload cyberclaims --update-env
```

- Secrets: `DB_*`, `SMTP_*`, `JWT_SECRET`, `TURNSTILE_SECRET`, `CF_API_TOKEN`, `CF_ZONE_ID`.
- **`npm install` vs `npm ci`:** `DEPLOY.md` explică de ce s-a folosit `npm install` — binding-urile wasm ale
  Tailwind v4/rolldown diferă între Windows (dev) și Linux (CI), iar `npm ci` pică pe lock drift. Într-un
  pipeline care buildează **doar** pe Linux, `npm ci` ar trebui să meargă. De verificat, nu de presupus.
- Workflow-ul de GitHub Pages și `BASE_PATH` **se șterg**.

---

## 8. Roadmap

| # | Etapă | Livrabil | Est. |
|---|---|---|---|
| 1 | **Restructurare + adaptor** | Monorepo (`site/` + `admin/` + `src/`), `@astrojs/node` middleware, Express host, VPS + PM2 + nginx + Cloudflare, CI/CD | 3z |
| 2 | **Lead-uri + email** | `POST /api/lead`, nodemailer, Turnstile, honeypot, Zod. **Cele 3 formulare încep să funcționeze.** | 2–3z |
| 3 | **Auth + shell admin** | Login, JWT, CSRF, `seed-admin`, layout SPA | 2z |
| 4 | **Blog API + media** | CRUD posts/translations/categories/authors, upload + sharp + variante srcset | 3–4z |
| 5 | **Admin: editor** | Tiptap, tab-uri per limbă, media library, publish → invalidare cache + purge CF, **preview pe site-ul real** | 6–7z |
| 6 | **Admin: leads + newsletter** | Tabel, status, export CSV, ștergere GDPR, double opt-in | 3z |
| 7 | **Site: blog SSR** | `news/[slug]`, listing magazine, featured card, tab-uri categorii, reading time, newsletter strip, JSON-LD (brief §4, azi 0%) | 3–4z |
| 8 | **Cache** | LRU în proces + headere + purge selectiv Cloudflare | 1z |
| 9 | **i18n — instalație** | `[...lang]`, dicționare type-safe, `link()`, hreflang, switcher, sitemap + **cele 3 bug-uri din §5**. Livrat cu `LOCALES = ['en']` | 3z |
| 10 | **Pagini legale → Content Collections** | DPA (868 linii JSX!), terms, privacy, cookies → Markdown per limbă | 2z |
| 11 | **Hardening + GDPR** | CSP, retenție, backup, audit | 2z |

**Total ≈ 30–34 zile-om**, fără traducerea propriu-zisă (care se scopează când se decid limbile).

**Etapele 1–2 (≈5 zile) repară producția** — lead-uri pierdute + mesaj fals de succes către victime de
fraudă. Merită livrate primele, independent de tot restul.

---

## 9. Amânat deliberat

- **Lista de limbi.** Instalația se construiește la etapa 9; conținutul tradus se scopează separat.
- **URL Checker.** Butonul e `type="button"` și pagina n-are niciun `<script>` — complet inert azi. Nu e o
  problemă de backend, e o **întrebare de produs**: ce înseamnă „check"? (vârsta domeniului via RDAP? SSL?
  Google Safe Browsing / URLhaus? o listă proprie de site-uri de scam?). Se scopează separat.
- **`ui_strings` în DB** (clientul își editează singur copy-ul) — se adaugă peste dicționare dacă e cerut.
- **Backend partajat cu TBSBV** (un singur API multi-tenant cu `site_id`). Tentant — e aceeași firmă — dar
  cuplează două proprietăți ale clientului. Backend separat, cod comun.

---

## 10. De confirmat înainte de start

1. **Unde hostăm?** VPS (recomandat) vs. hostingul Node de la Hostinger, unde rulează deja API-ul TBSBV.
2. **Cloudflare în față?** Dacă da, avem Turnstile + CDN + WAF gratis și cache-ul devine trivial.
3. **Restructurăm în monorepo** (`site/` + `admin/` + `src/`) — confirmă că e OK să mut proiectul Astro
   actual într-un subdirector.
4. **Paginile legale se traduc?** → cer jurist, nu doar traducător.
