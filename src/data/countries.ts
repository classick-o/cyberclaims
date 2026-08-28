// The ISO 3166-1 country list behind every "Country of Residence" select and every
// dial-code picker on the site.
//
// Generated, not hand-maintained: libphonenumber-js already ships the authoritative set
// of calling codes (it is the same data validating the numbers), and Intl.DisplayNames
// supplies the country names - translated, so a Dutch visitor picks "Duitsland" rather
// than "Germany". A hardcoded list would be a second source of truth that silently rots.
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';

export type Country = {
  /** ISO 3166-1 alpha-2, e.g. 'NL'. This is what gets stored. */
  code: CountryCode;
  /** Display name in the page's language. */
  name: string;
  /** Calling code WITHOUT the plus, e.g. '31'. */
  dial: string;
};

// Built once per locale per process - 245 entries sorted with a Collator is cheap, but
// not something to redo on every SSR request.
const cache = new Map<string, Country[]>();

export function countriesFor(locale = 'en'): Country[] {
  const hit = cache.get(locale);
  if (hit) return hit;

  const names = new Intl.DisplayNames([locale], { type: 'region' });
  const collator = new Intl.Collator(locale);

  const list = getCountries()
    .map((code) => ({
      code,
      // Falls back to the raw code rather than throwing, so an ICU build that doesn't
      // know a territory still yields a usable (if ugly) option instead of a 500.
      name: (() => {
        try {
          return names.of(code) ?? code;
        } catch {
          return code;
        }
      })(),
      dial: getCountryCallingCode(code),
    }))
    .sort((a, b) => collator.compare(a.name, b.name));

  cache.set(locale, list);
  return list;
}

/** Valid ISO codes, for validating what a form posts back. */
export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === 'string' && (getCountries() as string[]).includes(value);
}

/** Canonical English name for an ISO code - what we store alongside the code. */
export function countryNameEn(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}
