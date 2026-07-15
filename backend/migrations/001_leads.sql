-- Leads from all site forms.
--
-- One table, one `source` column, rather than a table per form: they are the same
-- entity (someone asking for help) captured with varying detail. The Start Process
-- wizard fills the incident columns; the hero and contact forms leave them NULL.
--
-- Only full_name and email are NOT NULL. Everything else is optional on purpose —
-- these forms are filled in by people who have just been defrauded, and a
-- half-complete lead is worth far more than a clean validation error.

CREATE TABLE IF NOT EXISTS leads (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  full_name         VARCHAR(200)  NOT NULL,
  email             VARCHAR(255)  NOT NULL,
  phone             VARCHAR(50)   DEFAULT NULL,
  country           VARCHAR(100)  DEFAULT NULL,
  message           TEXT          DEFAULT NULL,

  -- Start Process wizard. `amount_lost` is free text from the hero form and one of
  -- six bracket labels from the wizard, so it stays a string, not a number.
  amount_lost       VARCHAR(100)  DEFAULT NULL,
  platform_name     VARCHAR(255)  DEFAULT NULL,
  platform_website  VARCHAR(500)  DEFAULT NULL,
  first_transaction DATE          DEFAULT NULL,
  last_transaction  DATE          DEFAULT NULL,

  source            ENUM('hero','contact','start_process','url_checker') NOT NULL,
  locale            VARCHAR(5)    NOT NULL DEFAULT 'en',
  ip_address        VARCHAR(45)   DEFAULT NULL,   -- 45 = max IPv6 length
  user_agent        TEXT          DEFAULT NULL,

  status            ENUM('new','contacted','qualified','closed') NOT NULL DEFAULT 'new',

  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_status  (status),
  INDEX idx_source  (source),
  INDEX idx_created (created_at),
  INDEX idx_email   (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
