-- Add 'landing' to leads.source for the conversion landing pages.
--
-- source was ENUM('hero','contact','start_process','url_checker'); inserting a value
-- outside the set (e.g. 'landing') stored '' silently under a non-strict SQL mode, so
-- landing-page leads arrived untagged. Widen the ENUM, then re-tag the rows that came
-- in as ''. (Only landing submissions could have produced '', so this is safe.)

ALTER TABLE leads
  MODIFY COLUMN source ENUM('hero','contact','start_process','url_checker','landing') NOT NULL;

UPDATE leads SET source = 'landing' WHERE source = '';
