import { z } from 'zod';

const nullable = (max) =>
  z.string().trim().max(max).optional().transform((v) => v || null);

const translation = z.object({
  title: z.string().trim().min(3, 'Give the article a title.').max(255),
  slug: z.string().trim().max(255).optional(),   // derived from the title when blank
  excerpt: nullable(500),
  body_html: z.string().min(1, 'The article is empty.').max(500_000),
  seo_title: nullable(255),
  seo_description: nullable(320),
  keywords: z.array(z.string().trim().max(60)).max(20).default([]),
});

export const postSchema = z.object({
  category_id: z.coerce.number().int().positive().nullable().optional(),
  author_id: z.coerce.number().int().positive().nullable().optional(),
  cover_media_id: z.coerce.number().int().positive().nullable().optional(),
  featured: z.coerce.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  published_at: z.string().datetime().nullable().optional().or(z.literal('')),

  // At least one language must be present, and it must be a language we serve.
  translations: z
    .record(z.string().max(5), translation)
    .refine((t) => Object.keys(t).length > 0, 'A post needs at least one translation.'),
});

export const statusSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
});

export const categorySchema = z.object({
  key_slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only.')
    .max(100),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour.').optional().or(z.literal('')),
  sort_order: z.coerce.number().int().min(0).default(0),
  translations: z.record(
    z.string().max(5),
    z.object({
      name: z.string().trim().min(1).max(255),
      slug: z.string().trim().max(255).optional(),
    })
  ),
});

export const authorSchema = z.object({
  name: z.string().trim().min(2).max(255),
  role: nullable(255),
  bio: nullable(2000),
  avatar_id: z.coerce.number().int().positive().nullable().optional(),
});

export const leadStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'closed']),
});

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(255),
  locale: z.string().trim().max(5).default('en'),
  _honey: z.string().max(0).optional(),
  'cf-turnstile-response': z.string().max(4096).optional(),
});
