// @ts-check
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
  // route opts out with `export const prerender = false`. Only the blog will need
  // that — the marketing pages stay HTML on disk and never touch the database.
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
    plugins: [tailwindcss()],
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
