-- Uploaded media.
--
-- Files are re-encoded to WebP at upload in three widths, so `variants` holds the
-- srcset. That means the site never needs a runtime image service: it emits a plain
-- <img srcset> and the browser picks. `path` is the largest variant, used as the
-- src fallback.
--
-- Alt text is per-locale, in its own table, for the same reason post titles are:
-- a Dutch page with English alt text is broken for both screen readers and SEO.

CREATE TABLE IF NOT EXISTS media (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  filename   VARCHAR(255) NOT NULL,          -- original name, for the librarian's benefit
  path       VARCHAR(500) NOT NULL,          -- /uploads/2026/07/a1b2c3-1600.webp
  variants   JSON         DEFAULT NULL,      -- {"480":"...","960":"...","1600":"..."}
  mime       VARCHAR(100) NOT NULL,
  width      INT UNSIGNED DEFAULT NULL,
  height     INT UNSIGNED DEFAULT NULL,
  bytes      INT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_translations (
  media_id INT UNSIGNED NOT NULL,
  locale   VARCHAR(5)   NOT NULL,
  alt      VARCHAR(500) NOT NULL,
  PRIMARY KEY (media_id, locale),
  FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
