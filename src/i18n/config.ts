// Locale configuration.
//
// One entry today. The point of building this now rather than later is that the
// EXPENSIVE half of i18n is the routing - [...lang] segments, locale-aware link(),
// hreflang, canonical URLs, the sitemap. Retrofitting that across a finished site
// means touching every page again. The cheap half is the translations themselves,
// and those can only be written once someone decides which languages we serve.
//
// So: the plumbing is here, and with a single locale it is a no-op - every URL comes
// out exactly as it did before. Adding Dutch is this array plus src/i18n/nl.ts.

// English is first, and stays the default. prefixDefaultLocale:false keeps it at `/` -
// every existing URL survives - while the others live under /nl/, /fr/, /de/, /it/,
// /es/, /pt/.
export const LOCALES = ['en', 'nl', 'fr', 'de', 'it', 'es', 'pt'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_META: Record<Locale, {
  /** Shown in the language switcher - the language's own name (endonym). */
  label: string;
  /** <html lang>. */
  htmlLang: string;
  /** og:locale. */
  ogLocale: string;
  /** Passed to Intl.* - never hardcode 'en-US' anywhere else. */
  intl: string;
  /** ISO 3166-1 alpha-2 country code for the flag in the language switcher (file at /flags/<code>.svg). */
  flag: string;
}> = {
  en: { label: 'English', htmlLang: 'en', ogLocale: 'en_US', intl: 'en-GB', flag: 'GB' },
  nl: { label: 'Dutch', htmlLang: 'nl', ogLocale: 'nl_NL', intl: 'nl-NL', flag: 'NL' },
  fr: { label: 'Français', htmlLang: 'fr', ogLocale: 'fr_FR', intl: 'fr-FR', flag: 'FR' },
  de: { label: 'Deutsch', htmlLang: 'de', ogLocale: 'de_DE', intl: 'de-DE', flag: 'DE' },
  it: { label: 'Italiano', htmlLang: 'it', ogLocale: 'it_IT', intl: 'it-IT', flag: 'IT' },
  es: { label: 'Español', htmlLang: 'es', ogLocale: 'es_ES', intl: 'es-ES', flag: 'ES' },
  pt: { label: 'Português', htmlLang: 'pt', ogLocale: 'pt_PT', intl: 'pt-PT', flag: 'PT' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Reads the locale back out of a URL. The SSR routes (the blog) have no
 * getStaticPaths to hand it to them, so they resolve it from the path instead.
 */
export function localeFromUrl(url: URL): Locale {
  const first = url.pathname.split('/').filter(Boolean)[0];
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/**
 * getStaticPaths for every prerendered page under src/pages/[...lang]/.
 *
 * The default locale maps to `lang: undefined`, and a rest parameter matches zero
 * segments - so English keeps living at /about-us/ rather than /en/about-us/, and
 * every existing URL survives. That is not a detail: the redesign brief (§Scope)
 * says "keep all copy and page URLs", and a multilingual site that moved them would
 * be breaking that.
 */
export function localePaths() {
  return LOCALES.map((locale) => ({
    params: { lang: locale === DEFAULT_LOCALE ? undefined : locale },
    props: { locale },
  }));
}
