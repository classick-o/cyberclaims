// The languages the admin offers tabs for.
//
// The database has carried per-locale translation rows since the first migration, and the
// editor renders a tab per locale - so this array is the whole switch. It matches the
// locales the site serves (see src/i18n/config.ts). English is the source the "Translate
// from English" button reads from; the rest can be machine-translated and then reviewed.
// With a single locale the tab strip hides itself.
export const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
];

export const DEFAULT_LOCALE = 'en';
