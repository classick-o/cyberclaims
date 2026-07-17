// sitemap.xml
//
// Generated on demand, not by @astrojs/sitemap. The integration only knows the routes
// that exist at build time, and the articles do not - they live in the database and
// appear the moment an editor hits Publish. A sitemap that silently omits the blog is
// worse than useless for a site whose whole SEO case rests on it.

export const prerender = false;

import type { APIRoute } from 'astro';
import { Post, cached } from '../lib/content';
import { LOCALES, DEFAULT_LOCALE, type Locale } from '../i18n/config';
import { LANDING_SLUGS } from '../data/landing-content';

// Everything prerendered, with the priority the content deserves.
const STATIC_PAGES: { path: string; priority: number; changefreq: string }[] = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/about-us/', priority: 0.8, changefreq: 'monthly' },
  { path: '/services/', priority: 0.9, changefreq: 'monthly' },
  { path: '/cryptocurrency-recovery/', priority: 0.9, changefreq: 'monthly' },
  { path: '/cryptocurrency-tracing/', priority: 0.9, changefreq: 'monthly' },
  { path: '/website-forensics/', priority: 0.9, changefreq: 'monthly' },
  { path: '/brand-protection/', priority: 0.9, changefreq: 'monthly' },
  { path: '/website-takedown/', priority: 0.9, changefreq: 'monthly' },
  { path: '/dispute-resolution-support/', priority: 0.9, changefreq: 'monthly' },
  { path: '/consultancy-documentation-support/', priority: 0.9, changefreq: 'monthly' },
  { path: '/due-diligence-investigations/', priority: 0.9, changefreq: 'monthly' },
  { path: '/social-media-investigation/', priority: 0.9, changefreq: 'monthly' },
  { path: '/business-services/', priority: 0.9, changefreq: 'monthly' },
  { path: '/news/', priority: 0.8, changefreq: 'weekly' },
  { path: '/url-checker/', priority: 0.7, changefreq: 'monthly' },
  { path: '/phone-check/', priority: 0.8, changefreq: 'monthly' },
  { path: '/start-process/', priority: 0.9, changefreq: 'monthly' },
  { path: '/contact-us/', priority: 0.8, changefreq: 'monthly' },
  { path: '/privacy-policy/', priority: 0.3, changefreq: 'yearly' },
  { path: '/cookie-policy/', priority: 0.3, changefreq: 'yearly' },
  { path: '/terms-and-conditions/', priority: 0.3, changefreq: 'yearly' },
  { path: '/data-protection-addendum/', priority: 0.3, changefreq: 'yearly' },
];

// The service pages live under /services/<slug>/, but their href in the data is the
// bare slug - same shape the site itself uses.
const url = (path: string, locale: Locale, origin: string) => {
  const isService = /^\/(cryptocurrency|website|brand|dispute|consultancy|due-diligence|social-media|business)/.test(path);
  const full = isService ? `/services${path}` : path;
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return `${origin}${prefix}${full}`;
};

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin ?? 'https://www.cyberclaims.net';

  const posts = (await cached('sitemap:posts', () => Post.allPublishedSlugs()).catch(
    () => []
  )) as { locale: string; slug: string; updated_at: string }[];

  const entries: string[] = [];

  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      entries.push(`  <url>
    <loc>${escape(url(page.path, locale, origin))}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>`);
    }
  }

  for (const post of posts) {
    const locale = (LOCALES as readonly string[]).includes(post.locale)
      ? (post.locale as Locale)
      : DEFAULT_LOCALE;
    entries.push(`  <url>
    <loc>${escape(url(`/${post.slug}/`, locale, origin))}</loc>
    <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  // Conversion landing pages — single root URLs, not multiplied per locale.
  for (const slug of LANDING_SLUGS) {
    entries.push(`  <url>
    <loc>${escape(`${origin}/${slug}/`)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
};
