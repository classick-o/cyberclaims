-- Add 'investigator' to leads.source for the "Speak With an Investigator" case form on
-- the phone-checker country pages.
--
-- The ENUM must be widened in lockstep with the zod enum in lead.schema.js: a value the
-- app accepts but the column doesn't know is stored as '' under a non-strict SQL mode,
-- silently untagging the lead (that is exactly what happened to 'landing' - see 006).

ALTER TABLE leads
  MODIFY COLUMN source
    ENUM('hero','contact','start_process','url_checker','landing','investigator') NOT NULL;
