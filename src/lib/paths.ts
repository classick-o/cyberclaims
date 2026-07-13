// Internal-link helper.
//
// Every internal href on the site goes through link(). That single choke point is why
// adding locale routing cost one function rather than a sweep through every component.
//
// It does two things:
//
//  1. Prefixes the locale — except for the default one, which stays unprefixed. So
//     English keeps living at /about-us/ and Dutch would be at /nl/about-us/. The
//     brief (§Scope) says "keep all copy and page URLs"; this is what keeps that true.
//
//  2. Prefixes Astro's configured `base` (import.meta.env.BASE_URL), so links resolve
//     under a GitHub Pages sub-path as well as on the real domain. When base is '/'
//     that half is a no-op.
//
// External links, anchors, mailto: and tel: are returned untouched.

import { DEFAULT_LOCALE, type Locale } from '../i18n/config';

const BASE = import.meta.env.BASE_URL; // '/', or '/cyberclaims/'

export function link(path: string, locale: Locale = DEFAULT_LOCALE): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;

  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE; // '' when base is '/'
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  const p = path.startsWith('/') ? path : `/${path}`;

  return `${base}${prefix}${p}`;
}

/**
 * A file in public/ — an image, a font, the 3D model, the Draco decoder.
 *
 * Base-prefixed like link(), but NEVER locale-prefixed. This distinction is the whole
 * reason the function exists: public/values.webp lives at /values.webp in every
 * language. Route it through link() and the Dutch site asks for /nl/values.webp,
 * which does not exist — every image on the page silently 404s, and nothing in the
 * build warns you.
 */
export function asset(path: string): string {
  if (/^(https?:|data:)/.test(path)) return path;

  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

// Service detail pages live under /services/<slug>/. The service `href` in the data
// (e.g. '/cryptocurrency-tracing/') stays the internal key for image/content maps;
// this turns it into the actual page URL.
export function serviceUrl(href: string): string {
  return `/services${href}`;
}

/**
 * Absolute URL for canonical tags, hreflang alternates and structured data.
 *
 * Takes the site origin from Astro's `site` config rather than the incoming request,
 * so a request arriving on a stale host can't poison a canonical URL.
 */
export function absoluteUrl(path: string, locale: Locale, site: URL | undefined): string {
  const origin = site?.origin ?? 'https://www.cyberclaims.net';
  return new URL(link(path, locale), origin).href;
}

/**
 * The same page in another locale, for the language switcher and hreflang.
 *
 * Strips whatever locale prefix the current path carries, then reapplies the target
 * one — so switching language keeps you on the page you were reading instead of
 * dumping you on the homepage.
 */
export function swapLocale(pathname: string, target: Locale, locales: readonly string[]): string {
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  let path = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;

  const segments = path.split('/').filter(Boolean);
  if (locales.includes(segments[0]) && segments[0] !== DEFAULT_LOCALE) segments.shift();

  return link(`/${segments.join('/')}${segments.length ? '/' : ''}`, target);
}
