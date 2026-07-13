import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The admin is a plain SPA, separate from the Astro build. Express serves it from
// admin/dist at /admin — same origin as the API, which is the whole reason the
// session cookie works without any CORS or SameSite=None gymnastics.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/admin/',
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
});
