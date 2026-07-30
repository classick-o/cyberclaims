-- Structured fields for the "Was this number involved in a scam?" report form.
--
-- All nullable: every other form leaves them NULL, exactly like the Start Process
-- incident columns. They are real columns rather than prose stuffed into `message`
-- because the point of this form is triage - the admin needs to filter on scam type
-- and see at a glance whether money was lost.
--
-- Note on `phone`: for this form it holds the REPORTER's own number (for follow-up),
-- which matches its meaning on every other form. The number being reported is a
-- different thing and gets its own column.

ALTER TABLE leads
  ADD COLUMN reported_number VARCHAR(50)  DEFAULT NULL AFTER phone,
  ADD COLUMN scam_type       VARCHAR(120) DEFAULT NULL AFTER message,
  ADD COLUMN lost_money      TINYINT(1)   DEFAULT NULL AFTER scam_type;
