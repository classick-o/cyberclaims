// Content hygiene: sanitising, slugging, reading time.

import sanitizeHtml from 'sanitize-html';

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
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'srcset', 'alt', 'width', 'height', 'loading'],
    '*': [],
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

/** Strips markup and normalises whitespace — for word counts and excerpts. */
export function toPlainText(html) {
  return sanitizeHtml(html ?? '', { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}

/** 200 wpm, floor of 1. Computed once on save, never per render. */
export function readingMinutes(html) {
  const words = toPlainText(html).split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
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
