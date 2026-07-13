// The languages the admin offers tabs for.
//
// Deliberately one entry today. The database has carried per-locale translation rows
// since the first migration, and the editor renders a tab per locale — so adding
// Dutch is this array plus a dictionary file on the site, not a migration and not a
// rewrite of this screen. With a single locale the tab strip hides itself.
export const LOCALES = [{ code: 'en', label: 'English' }];

export const DEFAULT_LOCALE = 'en';
