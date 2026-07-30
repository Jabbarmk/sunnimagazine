-- Firebase Admin SDK service account, editable from the dashboard (Settings
-- page) instead of requiring SSH access to edit .env.local on the server.
-- Single-row table, same pattern as email_settings.

CREATE TABLE IF NOT EXISTS `firebase_settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `service_account_json` mediumtext DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
