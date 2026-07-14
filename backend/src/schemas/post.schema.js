import { z } from 'zod';

/**
 * An optional piece of text, stored as NULL when it is blank.
 *
 * `.nullish()`, not `.optional()`. This is the difference between the two:
 *
 *   .optional()  accepts  string | undefined
 *   .nullish()   accepts  string | null | undefined
 *
 * ...and the columns behind these fields are nullable, so `null` is exactly what
 * `GET /api/admin/posts/:id` hands back for an excerpt or an SEO title nobody filled in.
 * The editor loads the post, changes the body, and PUTs back the object it was given -
 * so with `.optional()` the API was rejecting its own output. Editing any article whose
 * SEO fields were left blank failed, with "Expected string, received null" and no clue
 * which field it meant.
 *
 * The rule this broke: whatever GET returns, PUT must accept. If the two disagree, the
 * only editable records are the ones where every field happens to be filled in.
 */
const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => v || null); // '', null and undefined all mean "no value"

const translation = z.object({
  title: z.string().trim().min(3, 'Give the article a title.').max(255),
  // nullish for the same reason: derived from the title when blank, and blank is NULL
  slug: z.string().trim().max(255).nullish(),
  excerpt: optionalText(500),
  body_html: z.string().min(1, 'The article is empty.').max(500_000),
  seo_title: optionalText(255),
  seo_description: optionalText(320),
  keywords: z.array(z.string().trim().max(60)).max(20).nullish().transform((v) => v ?? []),
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
  // `categories.color` is nullable, so GET returns null for one that has none - and the
  // same round-trip rule applies here as it does to the article's SEO fields above.
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour.')
    .nullish()
    .or(z.literal(''))
    .transform((v) => v || null),
  sort_order: z.coerce.number().int().min(0).default(0),
  translations: z.record(
    z.string().max(5),
    z.object({
      name: z.string().trim().min(1).max(255),
      slug: z.string().trim().max(255).nullish(),
    })
  ),
});

export const authorSchema = z.object({
  name: z.string().trim().min(2).max(255),
  role: optionalText(255),
  bio: optionalText(2000),
  avatar_id: z.coerce.number().int().positive().nullish(),
});

export const leadStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'closed']),
});
