-- Distributor login: each distributor can get a username + password so they can
-- sign in (dashboard portal /distributor and the mobile app) and update the
-- subscribers on their own list. Run once, after migrate_distribution.sql.
-- Passwords are stored as bcrypt hashes; NULL username/password = login disabled.

ALTER TABLE distribution_distributors
  ADD COLUMN username VARCHAR(60) NULL,
  ADD COLUMN password VARCHAR(255) NULL,
  ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN last_login DATETIME NULL,
  ADD UNIQUE KEY uq_distributor_username (username);

-- Free-text note a distributor (or admin) can leave against a subscriber.
ALTER TABLE distribution_subscribers
  ADD COLUMN remark VARCHAR(255) NULL;
