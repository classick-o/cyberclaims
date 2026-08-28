// Country helpers for the backend, mirroring src/data/countries.ts on the site side.
//
// Separate file, same source of truth: the site is TypeScript and the backend is plain
// JS, so they cannot share a module - but both derive everything from libphonenumber's
// country set and Intl, so the two can never disagree about which codes are valid.
import { getCountries } from 'libphonenumber-js';

const VALID = new Set(getCountries());

/** True for a real ISO 3166-1 alpha-2 code. */
export function isCountryCode(value) {
  return typeof value === 'string' && VALID.has(value.toUpperCase());
}

/**
 * Canonical ENGLISH name for an ISO code.
 *
 * Deliberately English regardless of the visitor's language: this is the value stored in
 * `country` and exported to the CRM, and a database mixing "Germany", "Duitsland" and
 * "Allemagne" is exactly the mess this change exists to end. The visitor still SEES the
 * name in their own language - that happens in the select, not here.
 */
export function countryNameEn(code) {
  if (!isCountryCode(code)) return null;
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}
