// Internal-link helper.
//
// Prefixes internal paths with Astro's configured `base` (import.meta.env.BASE_URL)
// so links resolve correctly both under a GitHub Pages sub-path (e.g. /cyberclaims/)
// and on the final custom domain (base = '/').
//
// When base is '/', this is a NO-OP - it returns the path unchanged. That means when
// we move to the client's domain we simply drop the BASE_PATH env / workflow and every
// link keeps working. Nothing in the codebase needs to be un-done.
//
// External links, anchors, mailto: and tel: are returned untouched.

const BASE = import.meta.env.BASE_URL; // '/', or '/cyberclaims/'

export function link(path: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE; // '' when base is '/'
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

// Service detail pages live under /services/<slug>/. The service `href` in the
// data (e.g. '/cryptocurrency-tracing/') stays the internal key for image/content
// maps; this turns it into the actual page URL.
export function serviceUrl(href: string): string {
  return `/services${href}`;
}

