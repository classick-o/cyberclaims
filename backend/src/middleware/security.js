import helmet from 'helmet';
import { isProd } from '../config/env.js';

// Security headers for the HTML the site serves. (The API sets its own - see app.js.)
//
// An honest note on script-src 'unsafe-inline': Astro inlines the hydration and
// server-island scripts, and the 3D hero and scroll-reveal live in inline <script>
// blocks. Removing 'unsafe-inline' means threading a per-request nonce through every
// one of them, which Astro does not yet do for us. So this CSP does NOT stop injected
// inline script.
//
// It is still worth having, because the other directives are not weakened by that:
//   object-src 'none'     - no Flash/applet embeds
//   base-uri 'self'       - an injected <base> cannot re-point every relative URL
//   form-action 'self'    - an injected form cannot post the lead data elsewhere
//   frame-ancestors 'none'- nobody can iframe the site to clickjack the lead forms
//   script-src <allowlist>- injected script cannot load a payload from an attacker's host
//
// Nonces are the follow-up, not a reason to ship nothing.
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      'default-src': ["'self'"],
      // 'wasm-unsafe-eval' is for the Draco decoder behind the hero's 3D model: without
      // it the browser refuses to compile the WebAssembly and the model silently never
      // loads - the canvas is there, empty. It permits WebAssembly compilation ONLY;
      // unlike 'unsafe-eval' it does not re-enable eval() or new Function().
      // Google Tag Manager loads gtm.js from googletagmanager.com, and the Ads
      // conversion tag it contains then pulls further script from googleadservices /
      // doubleclick. Without every one of these the tag silently does nothing and the
      // container reports "no data received".
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'wasm-unsafe-eval'",
        'https://challenges.cloudflare.com',
        'https://www.googletagmanager.com',
        'https://www.googleadservices.com',
        'https://googleads.g.doubleclick.net',
        'https://www.google.com',
        'https://www.gstatic.com',
      ],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      // https: because article covers may one day be served from a CDN; data: for the
      // inline SVG icons Astro emits.
      'img-src': ["'self'", 'data:', 'https:'],
      // GTM posts its measurement beacons over fetch/XHR, not just as image pixels.
      'connect-src': [
        "'self'",
        'https://challenges.cloudflare.com',
        'https://www.googletagmanager.com',
        'https://*.google-analytics.com',
        'https://*.analytics.google.com',
        'https://stats.g.doubleclick.net',
        'https://googleads.g.doubleclick.net',
        'https://td.doubleclick.net',
        'https://www.google.com',
      ],
      // Turnstile's widget, and the office map on /contact-us/.
      // googletagmanager.com is the <noscript> fallback iframe; the doubleclick hosts are
      // the Ads conversion frames.
      'frame-src': [
        'https://challenges.cloudflare.com',
        'https://maps.google.com',
        'https://www.google.com',
        'https://www.googletagmanager.com',
        'https://td.doubleclick.net',
        'https://bid.g.doubleclick.net',
      ],
      'worker-src': ["'self'", 'blob:'], // the Draco decoder for the 3D hero
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      // 'none' except Google's Tag Assistant, which debugs a container by loading the
      // site in an iframe - GTM's Preview button just fails against a flat 'none'. The
      // clickjacking protection this exists for is unaffected: only a Google-owned
      // origin is allowed, so no attacker page can frame the lead forms.
      // Was 'none'. It cannot stay 'none' AND allow Tag Assistant: per CSP3 'none' is
      // only valid as the sole value, so listing both makes the browser ignore the
      // 'none'. A bare allowlist is the correct spelling and is just as strict - any
      // origin not named here still cannot frame the site, so the clickjacking
      // protection over the lead forms is intact.
      'frame-ancestors': ['https://tagassistant.google.com'],
      ...(isProd ? { 'upgrade-insecure-requests': [] } : {}),
    },
  },
  // Two years, preloadable. Only meaningful over HTTPS, so production only - sending
  // it from a dev server on http would be noise.
  hsts: isProd ? { maxAge: 63_072_000, includeSubDomains: true, preload: true } : false,
  // The 3D hero loads a .glb and the Draco wasm decoder; the strict COEP/CORP defaults
  // block them without a matching header on every asset. Not worth the trade here.
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});
