import { DEFAULT_LOCALE, LOCALE_META, type Locale } from './config';
import { en, type UIKey } from './en';

// One dictionary per locale. `satisfies` means a new entry in LOCALES without a
// matching dictionary here is a compile error rather than a runtime `undefined`.
const DICTIONARIES = { en } satisfies Record<Locale, Record<UIKey, string>>;

/**
 * t('nav.about') — typed against the English keys, so a typo is a build failure.
 *
 * Falls back to English for a key a translation is missing. That fallback should
 * never fire: nl.ts is declared as Record<UIKey, string>, so tsc rejects an
 * incomplete dictionary. It exists for the case where a translation file is edited
 * by someone who bypasses the type check.
 */
export function useTranslations(locale: Locale) {
  const dict = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];

  return function t(key: UIKey, vars?: Record<string, string | number>): string {
    let value: string = dict[key] ?? en[key];
    if (vars) {
      for (const [name, replacement] of Object.entries(vars)) {
        value = value.replaceAll(`{${name}}`, String(replacement));
      }
    }
    return value;
  };
}

/**
 * Locale-aware number formatting.
 *
 * Sustainability.astro used to call toLocaleString('en-US') with the locale
 * hardcoded, which quietly renders "1,511" in a Dutch page where it should read
 * "1.511". Route every number through here.
 */
export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(LOCALE_META[locale].intl, options).format(value);
}

/**
 * Locale-aware date formatting from an ISO string.
 *
 * site.ts used to store dates as pre-formatted English text ("July 2, 2026"), which
 * cannot be translated and cannot be sorted. Store ISO, format here.
 */
export function formatDate(iso: string | Date, locale: Locale) {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(LOCALE_META[locale].intl, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export { DEFAULT_LOCALE, LOCALES, LOCALE_META, isLocale, localeFromUrl, localePaths } from './config';
export type { Locale } from './config';
export type { UIKey } from './en';
