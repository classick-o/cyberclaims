// English UI strings — the source of truth.
//
// What lives here: the site's CHROME. Navigation, buttons, form labels, section
// headings, status messages — text that repeats across pages and is short.
//
// What does NOT live here (yet): the long-form marketing and legal copy, which stays
// in src/data/*.ts and src/content/legal/. Extracting ~10,000 lines of prose into
// flat keys before anyone has decided which languages we serve would be speculative
// work, and prose belongs in prose files, not in a key-value map. Those files are
// already keyed by locale (see SERVICE_CONTENT), so a second language slots in
// without restructuring anything.
//
// Adding a language: create src/i18n/nl.ts as
//
//     import type { UIKey } from './en';
//     export const nl: Record<UIKey, string> = { ... };
//
// A missing key is then a COMPILE ERROR, not an empty string that ships to
// production and is noticed by a customer.

export const en = {
  // ── Navigation ─────────────────────────────────────────────────────────────
  'nav.home': 'Home',
  'nav.about': 'About Us',
  'nav.services': 'Services',
  'nav.news': 'News',
  'nav.contact': 'Contact Us',
  'nav.urlChecker': 'URL Checker',
  'nav.startProcess': 'Start Process',
  'nav.menu': 'Menu',
  'nav.close': 'Close',
  'nav.allServices': 'All services',

  // ── Buttons & shared actions ───────────────────────────────────────────────
  'cta.startProcess': 'Start Process',
  'cta.contactUs': 'Contact Us',
  'cta.learnMore': 'Learn more',
  'cta.readMore': 'Read more',
  'cta.backHome': 'Back to homepage',
  'cta.freeReview': 'Free case review · 48-hour response',

  // ── Lead forms ─────────────────────────────────────────────────────────────
  'form.fullName': 'Full Name',
  'form.email': 'Email',
  'form.phone': 'Phone Number',
  'form.country': 'Country of Residence',
  'form.amountLost': 'Amount Lost',
  'form.message': 'Message',
  'form.platformName': 'Platform Name',
  'form.platformWebsite': 'Platform Website',
  'form.firstTransaction': 'Date of First Transaction',
  'form.lastTransaction': 'Date of Last Transaction',
  'form.submit': 'Submit',
  'form.sending': 'Sending...',
  'form.back': 'Back',
  'form.next': 'Next',
  'form.legal':
    'Protected by CAPTCHA. Your details are confidential and reviewed by certified experts.',
  'form.successTitle': 'We have your details',
  'form.successBody':
    'A certified investigator will review your case and respond within 48 hours. Everything you sent us is confidential.',
  'form.errorGeneric':
    'Something went wrong on our side. Please try again, or email contact@cyberclaims.net.',
  'form.errorNetwork':
    'Could not reach the server. Please check your connection and try again.',

  // ── News / blog ────────────────────────────────────────────────────────────
  'news.title': 'News',
  'news.intro':
    'Guides, scam reviews and security research from our investigation team - so you can spot fraud early and stay a step ahead.',
  'news.imageAlt': 'Floating tiles showing a newspaper, magnifier, warning flag and shield',
  'news.allCategories': 'All',
  'news.readingTime': '{minutes} min read',
  'news.empty': 'No articles yet. Check back soon.',
  'news.related': 'Related reading',
  'news.seeAll': 'See all',
  'news.by': 'By',
  'news.backToNews': 'All articles',
  'news.loadMore': 'Load more',
  'news.loading': 'Loading…',

  // ── Article sidebar ────────────────────────────────────────────────────────
  'aside.services': 'Our services',
  'share.title': 'Share this article',
  'share.on': 'Share on {platform}',
  'news.draftBanner': 'You are previewing a draft. It is not visible to anyone else.',

  // ── Q&A block ──────────────────────────────────────────────────────────────
  // Rendered above the accordion whenever an article contains one. Injected
  // server-side rather than baked into the editor's output, so the copy stays in one
  // place, is translatable, and isn't duplicated into every article's stored HTML.
  'faq.eyebrow': 'Frequently asked questions',
  'faq.titleLead': 'Have any',
  'faq.titleAccent': 'questions?',
  'faq.body':
    "Can't find the answer you're looking for? Reach out to our team and we'll get back to you within 24 hours.",

  // ── Trust / footer ─────────────────────────────────────────────────────────
  'trust.moj': 'Dutch MOJ · POB {pob}',
  'trust.press': 'Featured in 350+ news outlets',
  'footer.rights': 'All rights reserved.',
  'footer.company': 'Transparent Business Solutions B.V.',

  // ── 404 ────────────────────────────────────────────────────────────────────
  'notFound.title': 'Page not found',
  'notFound.body':
    "That page doesn't exist, or has moved. If you were sent here by someone claiming to represent us, be careful — see the warning below.",
} as const;

export type UIKey = keyof typeof en;
