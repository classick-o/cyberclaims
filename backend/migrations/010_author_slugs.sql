-- Author pages need a stable URL, so authors get a slug of their own.
--
-- Stored rather than derived from the name at render time: renaming "ContentTeam" to
-- "Cyberclaims Research Team" must not silently move the page and break every link and
-- every crawl of it.
--
-- The backfill deliberately uses only LOWER/REPLACE, not REGEXP_REPLACE: this runs as a
-- boot migration, and a function the server's MariaDB does not have would fail the
-- migration and take the whole app down with it. Proper slugification (accents,
-- punctuation) happens in JS in the Author model for every author created from now on;
-- this only has to cope with the names already in the table.

ALTER TABLE authors
  ADD COLUMN slug VARCHAR(255) DEFAULT NULL AFTER name;

UPDATE authors
   SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '.', ''))
 WHERE slug IS NULL OR slug = '';

-- NULLs stay allowed (MySQL permits several in a UNIQUE index), so an author whose name
-- slugifies to nothing does not block the migration.
ALTER TABLE authors
  ADD UNIQUE KEY uq_author_slug (slug);
