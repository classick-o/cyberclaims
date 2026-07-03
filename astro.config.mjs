// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// `base` and `site` come from env so nothing is hard-coded:
//   • GitHub Pages (CI) sets BASE_PATH=/<repo>  → site builds under the sub-path
//   • Local dev / final custom domain leave it unset → base '/' (no-op link() helper)
const base = process.env.BASE_PATH || '/';
const site = process.env.SITE_URL || 'https://www.cyberclaims.net';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  vite: {
    plugins: [tailwindcss()],
  },
});
