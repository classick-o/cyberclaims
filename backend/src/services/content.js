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
