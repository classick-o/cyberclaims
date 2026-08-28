-- Structured identity fields on leads.
--
-- The CSV exports were unusable for CRM import: "Full Name" held anything from a first
-- name to a nickname, "Country of Residence" was free text (typos, abbreviations,
-- invented countries), and the phone had no reliable country code. The forms now collect
-- these as discrete, validated values.
--
-- `full_name`, `country` and `phone` are KEPT and still populated - full_name composed
-- from the two new name columns, country as the canonical English name for country_code,
-- phone as E.164. That keeps every existing lead, email template, admin view and export
-- working unchanged; the new columns are additive.

ALTER TABLE leads
  ADD COLUMN first_name   VARCHAR(100) DEFAULT NULL AFTER id,
  ADD COLUMN last_name    VARCHAR(100) DEFAULT NULL AFTER first_name,
  -- ISO 3166-1 alpha-2. CHAR(2) rather than a name: the code is the stable key, the
  -- display name is derived and translated per locale.
  ADD COLUMN country_code CHAR(2)      DEFAULT NULL AFTER country;
