-- Admin accounts.
--
-- No public signup, ever: accounts are created with `npm run seed:admin`. This is a
-- cybersecurity firm's own site — a self-service registration form on the admin
-- would be an embarrassing way to get owned.

CREATE TABLE IF NOT EXISTS admins (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  name           VARCHAR(255) NOT NULL,
  role           ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  last_login_at  TIMESTAMP    NULL DEFAULT NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
