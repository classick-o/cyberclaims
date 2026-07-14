// @ts-check
// This config runs in plain Node, BEFORE Astro loads .env into import.meta.env — so
// process.env here would otherwise only see the shell. Without it, setting PORT=3100
// in .env moved the API but left the dev proxy below still pointing at 3000, and the
// forms quietly stopped submitting in dev with no error anywhere.
import 'dotenv/config';

import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import { LOCALES, DEFAULT_LOCALE } from './src/i18n/config.ts';

// `base` and `site` come from env so nothing is hard-coded:
//   • GitHub Pages (CI) sets BASE_PATH=/<repo>  → site builds under the sub-path
//   • Local dev / final custom domain leave it unset → base '/' (no-op link() helper)
const base = process.env.BASE_PATH || '/';
const site = process.env.SITE_URL || 'https://www.cyberclaims.net';

const API_PORT = process.env.PORT || 3000;

// https://astro.build/config
export default defineConfig({
  site,
  base,

  // `static` + an adapter is Astro's hybrid mode: pages prerender by default, and a
  // route opts out with `export const prerender = false`. Only the blog needs that —
  // the marketing pages stay HTML on disk and never touch the database.
  // Locales live in src/i18n/config.ts (the single source of truth); this mirrors
  // them so Astro's own routing and the sitemap integration agree with us.
  // prefixDefaultLocale: false is what keeps English at / rather than /en/ — every
  // existing URL survives, which the redesign brief (§Scope) explicitly requires.
  i18n: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    routing: { prefixDefaultLocale: false },
  },

  output: 'static',
  adapter: node({ mode: 'middleware' }),

  vite: {
    // The Tailwind v4 plugin's own types don't line up with Vite's PluginOption union.
    // Nothing is wrong at runtime; the two packages just disagree about a generic.
    plugins: [/** @type {any} */ (tailwindcss())],

    // Why three.js is listed by hand:
    //
    // The hero's 3D object is imported from an Astro <script>, not from any page's
    // frontmatter. Vite's dep scanner does not look inside those, so it never
    // pre-bundles three — it discovers the import on the first request for the
    // homepage, re-runs the optimizer, and answers the in-flight import with
    // `504 Outdated Optimize Dep`. The module never loads, the object never renders,
    // and nothing is logged anywhere a person would look. A reload fixes it, which
    // is why this reads as "the 3D object is gone" only on the first page you open
    // after starting `npm run dev` — reliably, every time.
    //
    // Naming the entry points here makes the optimizer run once, up front, with the
    // right graph. Dev only; the production build bundles them regardless.
    optimizeDeps: {
      include: [
        'three',
        'three/examples/jsm/loaders/GLTFLoader.js',
        'three/examples/jsm/loaders/DRACOLoader.js',
        'three/examples/jsm/environments/RoomEnvironment.js',
      ],
    },

    server: {
      // `astro dev` runs on :4321 while the API runs on :3000. Proxying keeps the
      // forms posting to a same-origin /api/lead in dev exactly as they do in prod.
      proxy: {
        '/api': {
          target: `http://localhost:${API_PORT}`,
          changeOrigin: true,
        },
      },
    },
  },
});
