-- Blog ("News").
--
-- The shape is: an entity row that holds everything language-independent, plus one
-- translation row per language. Adding Dutch later is INSERT-only — no schema change,
-- no migration, no backfill. That is the entire reason this table split exists even
-- though the site ships with one locale today.
--
-- Categories are keyed on a stable `key_slug` that never gets translated, because
-- keying anything on display text is how you silently break a mapping the moment
-- someone translates it. (See BENTO_IMG in src/pages/services/[service].astro for
-- what that looks like when you get it wrong.)

CREATE TABLE IF NOT EXISTS authors (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  role      VARCHAR(255) DEFAULT NULL,       -- "Head of Blockchain Forensics"
  bio       TEXT         DEFAULT NULL,
  avatar_id INT UNSIGNED DEFAULT NULL,
  FOREIGN KEY (avatar_id) REFERENCES media(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  key_slug   VARCHAR(100) NOT NULL UNIQUE,   -- stable id, never translated
  color      VARCHAR(20)  DEFAULT NULL,
  sort_order INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS category_translations (
  category_id INT UNSIGNED NOT NULL,
  locale      VARCHAR(5)   NOT NULL,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL,
  PRIMARY KEY (category_id, locale),
  UNIQUE KEY uq_locale_slug (locale, slug),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id    INT UNSIGNED DEFAULT NULL,
  author_id      INT UNSIGNED DEFAULT NULL,
  cover_media_id INT UNSIGNED DEFAULT NULL,
  featured       TINYINT(1)   NOT NULL DEFAULT 0,   -- brief §4: the magazine hero card
  status         ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  published_at   DATETIME     DEFAULT NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_pub (status, published_at),
  INDEX idx_featured   (featured),
  FOREIGN KEY (category_id)    REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id)      REFERENCES authors(id)    ON DELETE SET NULL,
  FOREIGN KEY (cover_media_id) REFERENCES media(id)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_translations (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id         INT UNSIGNED NOT NULL,
  locale          VARCHAR(5)   NOT NULL,
  slug            VARCHAR(255) NOT NULL,     -- its own slug per language: SEO is won on local keywords
  title           VARCHAR(255) NOT NULL,
  excerpt         TEXT         DEFAULT NULL,
  body_html       MEDIUMTEXT   NOT NULL,     -- sanitised on WRITE, not on render
  seo_title       VARCHAR(255) DEFAULT NULL,
  seo_description VARCHAR(320) DEFAULT NULL,
  keywords        JSON         DEFAULT NULL, -- JSON-LD
  reading_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 1,  -- computed on save, not per render
  UNIQUE KEY uq_post_locale (post_id, locale),
  UNIQUE KEY uq_locale_slug (locale, slug),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The categories the current (hardcoded) cards on /news/ already use, so the first
-- import has somewhere to land.
INSERT IGNORE INTO categories (key_slug, color, sort_order) VALUES
  ('crypto-scams',   '#8b5bbd', 1),
  ('regulation',     '#a880d1', 2),
  ('recovery',       '#6b3fa0', 3),
  ('investigations', '#7a4fb0', 4);

INSERT IGNORE INTO category_translations (category_id, locale, name, slug)
SELECT id, 'en',
  CASE key_slug
    WHEN 'crypto-scams'   THEN 'Crypto Scams'
    WHEN 'regulation'     THEN 'Regulation'
    WHEN 'recovery'       THEN 'Recovery'
    WHEN 'investigations' THEN 'Investigations'
  END,
  key_slug
FROM categories;
