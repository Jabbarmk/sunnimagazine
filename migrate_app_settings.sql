-- General app-wide settings, single row (same pattern as `ticker`).
-- Starts with just the logo; room to add more app-wide settings later
-- without needing a new table each time.

CREATE TABLE IF NOT EXISTS `app_settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `logo` varchar(500) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `app_settings` (`id`, `logo`) VALUES (1, NULL);
