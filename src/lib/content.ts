// The site's window onto the content database.
//
// Astro and Express run in ONE Node process, so these are direct model calls — no
// fetch, no JSON round-trip, no public content API to secure and version. That is the
// main dividend of the single-process architecture, and the reason there is no
// /api/public/posts endpoint anywhere in this codebase.
//
// Only SSR routes (`export const prerender = false`) may import this. A prerendered
// page that pulled it in would drag mysql2 into the build and try to reach a database
// that isn't running.

import jwt from 'jsonwebtoken';
import type { AstroCookies } from 'astro';

import { Post } from '../../backend/src/models/Post.js';
import { Category } from '../../backend/src/models/Taxonomy.js';
import { cached } from '../../backend/src/services/contentCache.js';
import { extractFaq } from '../../backend/src/services/content.js';
import { env } from '../../backend/src/config/env.js';

export { Post, Category, cached, extractFaq };

export type PostCard = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  reading_minutes: number;
  published_at: string;
  featured: number;
  category_key: string | null;
  category_name: string | null;
  category_slug: string | null;
  category_color: string | null;
  author_name: string | null;
  author_role: string | null;
  cover_path: string | null;
  cover_variants: Record<string, string> | null;
  cover_alt: string | null;
  cover_width: number | null;
  cover_height: number | null;
  keywords: string[];
  seo_title: string | null;
  seo_description: string | null;
};

export type FullPost = PostCard & { body_html: string; status: string; updated_at: string };

/**
 * Is this request coming from a signed-in editor?
 *
 * Used to gate draft previews. The admin session cookie is httpOnly and same-origin,
 * so the SSR route can read it directly — no preview tokens to mint, leak or expire.
 * If the cookie doesn't verify, the draft simply 404s like it does for everyone else.
 */
export function isEditor(cookies: AstroCookies): boolean {
  const token = cookies.get('cc_session')?.value;
  if (!token) return false;
  try {
    jwt.verify(token, env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

/** srcset from the WebP variants sharp produced at upload. */
export function srcset(variants: Record<string, string> | null): string | undefined {
  if (!variants) return undefined;
  return Object.entries(variants)
    .map(([width, path]) => `${path} ${width}w`)
    .join(', ');
}
