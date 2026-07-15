// Unit tests for the pure content/validation layer. No DB, no HTTP.
import {
  slugify, slugConflict, sanitizeBody, toPlainText, toExcerptText,
  autoExcerpt, readingMinutes, extractFaq,
} from './src/services/content.js';
import { postSchema } from './src/schemas/post.schema.js';
import { leadSchema } from './src/schemas/lead.schema.js';

let pass = 0, fail = 0;
const fails = [];
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; } else { fail++; fails.push(`${name}${detail ? ' - ' + detail : ''}`); }
};
const eq = (name, got, want) => ok(name, got === want, `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
const has = (name, hay, needle) => ok(name, String(hay).includes(needle), `"${needle}" not in ${JSON.stringify(String(hay).slice(0,120))}`);
const not = (name, hay, needle) => ok(name, !String(hay).includes(needle), `"${needle}" LEAKED into ${JSON.stringify(String(hay).slice(0,160))}`);

// slugify
eq('slugify basic', slugify('Hello World'), 'hello-world');
eq('slugify accents', slugify('Café Déjà'), 'cafe-deja');
eq('slugify trims hyphens', slugify('  --Hi!!  '), 'hi');
eq('slugify collapses', slugify('a___b   c'), 'a-b-c');
eq('slugify emoji', slugify('crypto 🚀 scam'), 'crypto-scam');
eq('slugify all-symbols', slugify('!@#$%^&*()'), '');
eq('slugify empty', slugify(''), '');
eq('slugify number', slugify(12345), '12345');
ok('slugify 200 cap', slugify('a'.repeat(500)).length === 200, `len ${slugify('a'.repeat(500)).length}`);
eq('slugify cyrillic (no latin)', slugify('Привет'), ''); // NFKD does not latinise Cyrillic
eq('slugify path chars', slugify('a/b\\c'), 'a-b-c');

// slugConflict
ok('reserved about-us', slugConflict('about-us') !== null);
ok('reserved news', slugConflict('news') !== null);
ok('reserved admin', slugConflict('admin') !== null);
ok('reserved en', slugConflict('en') !== null);
ok('empty slug rejected', slugConflict('') !== null);
eq('normal slug ok', slugConflict('five-red-flags'), null);
eq('reserved is case/exact', slugConflict('about-us-2'), null);

// sanitizeBody: XSS vectors
not('strips <script>', sanitizeBody('<p>hi</p><script>alert(1)</script>'), 'alert');
not('strips onerror', sanitizeBody('<img src=x onerror="alert(1)">'), 'onerror');
not('strips onclick', sanitizeBody('<p onclick="steal()">x</p>'), 'onclick');
not('strips javascript: href', sanitizeBody('<a href="javascript:alert(1)">x</a>'), 'javascript');
not('strips data: img', sanitizeBody('<img src="data:image/svg+xml,<svg onload=alert(1)>">'), 'data:');
not('strips <iframe>', sanitizeBody('<iframe src="https://evil.test"></iframe>'), 'iframe');
not('strips <style>', sanitizeBody('<style>body{display:none}</style><p>x</p>'), 'display:none');
not('strips <svg onload>', sanitizeBody('<svg onload="alert(1)"></svg>'), 'onload');
not('strips <object>', sanitizeBody('<object data="evil"></object>'), 'object');
not('strips form', sanitizeBody('<form action="//evil"><input></form>'), '<form');
not('strips class smuggle', sanitizeBody('<section class="evil-hijack">x</section>'), 'evil-hijack');
not('strips arbitrary class on p', sanitizeBody('<p class="hijack">x</p>'), 'hijack');
has('keeps allowed section.faq', sanitizeBody('<section class="faq"><details class="faq-item"><summary>Q</summary><p>A</p></details></section>'), 'faq');
has('keeps <strong>', sanitizeBody('<p><strong>bold</strong></p>'), '<strong>');
has('external link gets noopener', sanitizeBody('<a href="https://x.test">x</a>'), 'noopener');
has('external link gets _blank', sanitizeBody('<a href="https://x.test">x</a>'), '_blank');
not('mailto stays, no rel forced onto internal', sanitizeBody('<a href="/news/">x</a>'), 'noopener');
eq('sanitize null', sanitizeBody(null), '');
eq('sanitize undefined', sanitizeBody(undefined), '');
// protocol-relative + uppercase JS scheme
not('strips JavaScript: (mixed case)', sanitizeBody('<a href="JaVaScRiPt:alert(1)">x</a>'), 'alert');
not('strips vbscript:', sanitizeBody('<a href="vbscript:msgbox(1)">x</a>'), 'vbscript');

// toPlainText / block spacing
eq('block boundary space', toPlainText('<p>a</p><p>b</p>'), 'a b');
eq('list boundary space', toPlainText('<ul><li>a</li><li>b</li></ul>'), 'a b');
eq('nested strip', toPlainText('<p>Hello <strong>there</strong> world</p>'), 'Hello there world');
eq('plain empty', toPlainText(''), '');

// toExcerptText: skips FAQ
const withFaq = '<p>Intro prose here.</p><section class="faq"><details class="faq-item"><summary>Question?</summary><p>Answer body.</p></details></section>';
eq('excerpt skips faq', toExcerptText(withFaq), 'Intro prose here.');
has('plaintext keeps faq words', toPlainText(withFaq), 'Question');

// autoExcerpt
ok('short excerpt no ellipsis', !autoExcerpt('<p>short</p>').endsWith('…'));
const long = '<p>' + 'word '.repeat(80) + '</p>';
ok('long excerpt ellipsis', autoExcerpt(long).endsWith('…'));
ok('long excerpt <= ~201', autoExcerpt(long).length <= 201, `len ${autoExcerpt(long).length}`);
ok('excerpt cuts on word', !/\bwor$/.test(autoExcerpt(long).replace('…','')), 'cut mid-word');

// readingMinutes
eq('reading floor 1', readingMinutes('<p>one two three</p>'), 1);
eq('reading empty floor 1', readingMinutes(''), 1);
eq('reading 400 words = 2', readingMinutes('<p>' + 'w '.repeat(400) + '</p>'), 2);

// extractFaq
const faqHtml = '<section class="faq"><details class="faq-item"><summary>Is X a scam?</summary><p>Yes because <strong>reasons</strong>.</p></details><details class="faq-item"><summary>How to recover?</summary><p>Call us.</p></details></section>';
const faq = extractFaq(faqHtml);
eq('faq count', faq.length, 2);
eq('faq q1', faq[0]?.question, 'Is X a scam?');
eq('faq a1 flattened', faq[0]?.answer, 'Yes because reasons.');
eq('faq no faq marker', extractFaq('<p>no faq here</p>').length, 0);
// half pair dropped
eq('faq half-pair dropped', extractFaq('<section class="faq"><details class="faq-item"><summary>Q only</summary></details></section>').length, 0);
// answer with a list
const faqList = extractFaq('<section class="faq"><details class="faq-item"><summary>Q?</summary><ul><li>one</li><li>two</li></ul></details></section>');
eq('faq answer with list', faqList[0]?.answer, 'one two');

// postSchema: the GET→PUT round-trip contract (null-tolerant)
const nullish = postSchema.safeParse({
  status: 'published', featured: false, category_id: null, author_id: null, cover_media_id: null,
  translations: { en: { title: 'A valid title', body_html: '<p>x</p>', excerpt: null, seo_title: null, seo_description: null, keywords: null } },
});
ok('postSchema accepts null SEO fields (the bug we fixed)', nullish.success, JSON.stringify(nullish.error?.issues?.[0]));
ok('postSchema null excerpt → null', nullish.success && nullish.data.translations.en.excerpt === null);
ok('postSchema null keywords → []', nullish.success && Array.isArray(nullish.data.translations.en.keywords));

// empty body rejected
const emptyBody = postSchema.safeParse({ status: 'draft', translations: { en: { title: 'Valid title', body_html: '' } } });
ok('postSchema rejects empty body', !emptyBody.success);
// short title rejected
const shortTitle = postSchema.safeParse({ status: 'draft', translations: { en: { title: 'ab', body_html: '<p>x</p>' } } });
ok('postSchema rejects <3-char title', !shortTitle.success);
// no translations rejected
const noTr = postSchema.safeParse({ status: 'draft', translations: {} });
ok('postSchema rejects empty translations', !noTr.success);
// unknown key stripped
const stripped = postSchema.safeParse({ status: 'draft', evil: 'x', translations: { en: { title: 'Valid title', body_html: '<p>x</p>' } } });
ok('postSchema strips unknown top-level key', stripped.success && !('evil' in stripped.data));
// bad status
ok('postSchema rejects bad status', !postSchema.safeParse({ status: 'nope', translations: { en: { title: 'Valid title', body_html: '<p>x</p>' } } }).success);

// leadSchema
ok('leadSchema needs a source', !leadSchema.safeParse({ full_name: 'Jo Bloggs', email: 'a@b.co' }).success);
ok('leadSchema minimal ok', leadSchema.safeParse({ source: 'hero', full_name: 'Jo Bloggs', email: 'a@b.co' }).success);
ok('leadSchema rejects bad email', !leadSchema.safeParse({ source: 'hero', full_name: 'Jo Bloggs', email: 'not-an-email' }).success);
ok('leadSchema rejects 1-char name', !leadSchema.safeParse({ source: 'hero', full_name: 'A', email: 'a@b.co' }).success);
ok('leadSchema lowercases email', (() => { const r = leadSchema.safeParse({ source: 'hero', full_name: 'Jo Bloggs', email: 'MiXeD@B.Co' }); return r.success && r.data.email === 'mixed@b.co'; })());
ok('leadSchema blank date → null', (() => { const r = leadSchema.safeParse({ source: 'hero', full_name: 'Jo Bloggs', email: 'a@b.co', first_transaction: '' }); return r.success && r.data.first_transaction === null; })());
ok('leadSchema bad date rejected', !leadSchema.safeParse({ source: 'hero', full_name: 'Jo Bloggs', email: 'a@b.co', first_transaction: '13/07/2026' }).success);
ok('leadSchema honeypot filled rejected', !leadSchema.safeParse({ source: 'hero', full_name: 'Jo Bloggs', email: 'a@b.co', _honey: 'bot' }).success);

// (jsonLdScript's escaping is verified end-to-end against the built site in test-deep.mjs
//  - the JSON-LD XSS block - rather than a hand-copied reimplementation here.)

console.log(`\n  UNIT: ${pass} passed, ${fail} failed`);
if (fails.length) { console.log('\n  FAILURES:'); fails.forEach((f) => console.log('    ✗ ' + f)); }
process.exit(fail ? 1 : 0);
