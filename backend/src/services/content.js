// Content hygiene: sanitising, slugging, reading time.

import sanitizeHtml from 'sanitize-html';
import { Parser } from 'htmlparser2';

// Sanitise on WRITE, not on render.
//
// TBSBV stores raw HTML in a TypeScript literal and pipes it straight through
// `set:html`. That's survivable only because the author is a developer with commit
// access. Ours comes from a rich-text editor used by a non-technical person, so the
// database must never hold anything we wouldn't be willing to inject — sanitising at
// render time instead would mean one forgotten call site is an XSS on the whole site.
const ALLOWED = {
  allowedTags: [
    'p', 'br', 'hr',
    'h2', 'h3', 'h4',
    'strong', 'em', 'u', 's', 'code', 'pre', 'blockquote',
    'ul', 'ol', 'li',
    'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    // The Q&A block. <details>/<summary> is a native accordion: no JavaScript, keyboard
    // accessible, and Google indexes the answer even while it is collapsed. Note there
    // is no <div> here and there never should be — <details> takes flow content
    // directly after its <summary>, so the answer's paragraphs are simply its children.
    'section', 'details', 'summary',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'srcset', 'alt', 'width', 'height', 'loading'],
    section: ['class'],
    details: ['class'],
    '*': [],
  },
  // `class` is allowed on exactly two tags and may hold exactly one value each. An
  // editor cannot smuggle in arbitrary classes to hijack the site's styles.
  allowedClasses: {
    section: ['faq'],
    details: ['faq-item'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  // Anything the editor emits with a relative /uploads/ src stays; everything else
  // must be an absolute http(s) URL. No data: URIs — that's an XSS vector dressed
  // up as an image.
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
  transformTags: {
    // An external link opened in a new tab without rel=noopener hands the opener
    // window to whatever it points at.
    a: (tagName, attribs) => {
      const href = attribs.href ?? '';
      const external = /^https?:\/\//i.test(href);
      return {
        tagName,
        attribs: external
          ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
          : attribs,
      };
    },
  },
};

export function sanitizeBody(html) {
  return sanitizeHtml(html ?? '', ALLOWED);
}

// Stripping tags is not the same as reading the text. `<p>a</p><p>b</p>` with the tags
// simply deleted is "ab" — so an excerpt read "…the same every time.How do I know if…"
// and the word count was wrong too. Put a space where a block ends.
const BLOCK_END = /<\/(p|h[1-6]|li|ul|ol|blockquote|section|details|summary|figcaption|td|th|tr|pre|div)\s*>/gi;

/** Strips markup and normalises whitespace — for word counts. */
export function toPlainText(html) {
  return sanitizeHtml(String(html ?? '').replace(BLOCK_END, ' </$1>'), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * The article's PROSE, with the Q&A block left out.
 *
 * An auto-excerpt is a taste of the article. Pulling the FAQ into it produces a card
 * that reads "…the pattern was the same every time. How do I know if I have been a
 * victim of a crypto scam? Unexpected requests for transfers in cryptocurr" — the
 * questions are not prose, and half of one is not a summary.
 *
 * Reading time still counts the FAQ, because the reader still reads it.
 */
export function toExcerptText(html) {
  if (!html) return '';

  const BLOCK = new Set(['p', 'h2', 'h3', 'h4', 'li', 'blockquote', 'figcaption', 'td', 'th', 'pre']);
  let text = '';
  let skipping = 0;

  const parser = new Parser({
    onopentag(name, attribs) {
      if (skipping > 0) {
        skipping++;
        return;
      }
      if (name === 'section' && (attribs.class ?? '').includes('faq')) skipping = 1;
    },
    ontext(chunk) {
      if (skipping === 0) text += chunk;
    },
    onclosetag(name) {
      if (skipping > 0) {
        skipping--;
        return;
      }
      if (BLOCK.has(name)) text += ' ';
    },
  });

  parser.write(html);
  parser.end();

  return text.replace(/\s+/g, ' ').trim();
}

/** An excerpt the editor didn't write. Cut on a word, not mid-syllable. */
export function autoExcerpt(html, max = 200) {
  const text = toExcerptText(html);
  if (text.length <= max) return text;

  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  // Only honour the word boundary if it isn't absurdly early (one very long word).
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** 200 wpm, floor of 1. Computed once on save, never per render. */
export function readingMinutes(html) {
  const words = toPlainText(html).split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Pulls the question/answer pairs out of an article's Q&A blocks, as plain text.
 *
 * Feeds the FAQPage structured data on the article page — which is what makes Google
 * render the questions as expandable rows directly in the search result. For a site
 * fighting for "is X a scam" queries, that is not a nice-to-have.
 *
 * A real parser, not a regex: the answer is ordinary article content and can contain
 * anything the rest of the body can, so pattern-matching for the closing tag would
 * break the first time someone put a list inside an answer.
 */
export function extractFaq(html) {
  if (!html || !html.includes('faq-item')) return [];

  const items = [];
  let inItem = false;
  let inQuestion = false;
  let question = '';
  let answer = '';

  const parser = new Parser({
    onopentag(name, attribs) {
      if (name === 'details' && (attribs.class ?? '').includes('faq-item')) {
        inItem = true;
        question = '';
        answer = '';
        return;
      }
      if (inItem && name === 'summary') inQuestion = true;
    },
    ontext(text) {
      if (!inItem) return;
      if (inQuestion) question += text;
      else answer += text;
    },
    onclosetag(name) {
      if (!inItem) return;

      if (name === 'summary') {
        inQuestion = false;
        return;
      }

      if (name === 'details') {
        inItem = false;
        const q = question.replace(/\s+/g, ' ').trim();
        const a = answer.replace(/\s+/g, ' ').trim();
        // A half-written pair is not an FAQ entry — and Google penalises FAQPage markup
        // that doesn't match visible content.
        if (q && a) items.push({ question: q, answer: a });
        return;
      }

      // Block boundaries become spaces, so two paragraphs don't run into oneword.
      if (['p', 'li', 'h2', 'h3', 'h4', 'blockquote'].includes(name)) answer += ' ';
    },
  });

  parser.write(html);
  parser.end();

  return items;
}

export function slugify(input) {
  return String(input)
    .normalize('NFKD') // "Café" -> "Cafe"; splits the accent off as a combining mark
    .replace(/[̀-ͯ]/gu, '') // ...which we then drop
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

/**
 * Slugs an article may not have.
 *
 * Articles are served from the ROOT of the site — /<slug>/, not /news/<slug>/ — so they
 * share one namespace with every page on it. A static page always wins the route. An
 * article slugged `about-us` would therefore save cleanly, report itself as published,
 * and be permanently unreachable, with nothing anywhere to say why. The editor would
 * conclude the CMS is broken, and they would be right.
 *
 * So the collision is refused at the door, where there is still a human to tell.
 *
 * This list is hardcoded, and it has to be kept in step with `src/pages/[...lang]/*` and
 * `src/content/legal/*`. Reading the route table would be nicer, but the backend cannot
 * see it: Astro's routes exist at build time, and in a deployed image the source tree
 * that defines them is not necessarily next to the server that would have to read it.
 *
 * Compared against the SLUGGED value, which is the only thing that ever becomes a URL.
 * That is also why /sitemap.xml, /robots.txt and /_astro/ are absent: slugify() emits
 * [a-z0-9-] and nothing else, so no title on earth can slug to a path containing a dot
 * or an underscore. Listing them would be a guard that can never fire — worse than no
 * guard, because it reads like one that can.
 */
export const RESERVED_SLUGS = new Set([
  // pages — src/pages/[...lang]/
  'about-us',
  'contact-us',
  'news',
  'services',
  'start-process',
  'thank-you',
  'url-checker',
  '404',
  // legal documents — src/content/legal/
  'privacy-policy',
  'cookie-policy',
  'terms-and-conditions',
  'data-protection-addendum',
  // Express owns these, before Astro ever sees the request
  'admin',
  'api',
  'uploads',
  // Locale prefixes. /nl/ must route to the Dutch site, not to an article called "nl".
  // Mirrors LOCALES in src/i18n/config.ts.
  'en',
]);

/** @returns {string | null} why this slug cannot be used, or null if it can. */
export function slugConflict(slug) {
  if (!slug) return 'The title produced an empty URL. Give the article a slug.';
  if (RESERVED_SLUGS.has(slug)) {
    return `"/${slug}/" is already a page on the site, so an article there would never be reachable. Choose a different URL slug.`;
  }
  return null;
}
