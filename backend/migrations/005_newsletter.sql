-- Newsletter subscribers (brief §4 asks for the strip on /news/).
--
-- Double opt-in is not optional: under GDPR/the ePrivacy directive, a Dutch company
-- mailing an address that only ever appeared in a form field — with no confirmed
-- intent — is sending unsolicited commercial mail. `pending` means we have an address
-- and nothing else; only `confirmed` may be mailed.

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email        VARCHAR(255) NOT NULL UNIQUE,
  locale       VARCHAR(5)   NOT NULL DEFAULT 'en',
  status       ENUM('pending','confirmed','unsubscribed') NOT NULL DEFAULT 'pending',
  token        VARCHAR(64)  NOT NULL,        -- confirm + unsubscribe, single value
  confirmed_at TIMESTAMP    NULL DEFAULT NULL,
  ip_address   VARCHAR(45)  DEFAULT NULL,    -- proof of consent, for a regulator
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_token (token),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
