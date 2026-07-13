import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The legal pages, one Markdown file per locale.
//
// They used to be raw JSX — the Data Protection Addendum alone was 868 lines of
// <div>s and <p>s with the text inlined between them. That is unmaintainable for a
// developer and untouchable for a lawyer, and it cannot be translated without
// duplicating the whole file. Now: src/content/legal/<locale>/<page>.md.
//
// The copy was extracted verbatim and compared character-by-character against the
// original markup. Do not "tidy" it — it is a regulated document.
const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Present only on pages that actually state an effective date. Unquoted YAML dates
    // parse as Date, not string, hence coerce.
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { legal };
