-- Add 'scam_report' to leads.source for the "Was this number involved in a scam?" prompt
-- shown after a phone report is generated.
--
-- The ENUM must be widened in lockstep with the zod enum in lead.schema.js: a value the
-- app accepts but the column doesn't know is stored as '' under a non-strict SQL mode,
-- silently untagging the lead (that is exactly what happened to 'landing' - see 006).

ALTER TABLE leads
  MODIFY COLUMN source
    ENUM('hero','contact','start_process','url_checker','landing','investigator','scam_report') NOT NULL;
