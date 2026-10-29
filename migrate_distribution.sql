-- Distribution Management: distributors and the subscribers on each distributor's
-- monthly distribution list (mirrors the "Distributor-wise List" report).
-- Separate from app_users; subscription status is computed from expiry_month.

CREATE TABLE IF NOT EXISTS `distribution_distributors` (
  `code` int(11) NOT NULL,                              -- distributor number from the report
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `state` varchar(100) DEFAULT 'DUBAI',
  `area` varchar(150) DEFAULT NULL,
  `archived_removed` int(11) NOT NULL DEFAULT 0,        -- subscribers already dropped from the list (expired > 3 months)
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `distribution_subscribers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `distributor_code` int(11) NOT NULL,
  `sub_code` int(11) NOT NULL,                          -- subscriber code from the report
  `name` varchar(255) NOT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `start_month` char(7) DEFAULT NULL,                   -- YYYY-MM
  `expiry_month` char(7) DEFAULT NULL,                  -- YYYY-MM (last issue month)
  `years` tinyint(4) DEFAULT NULL,                      -- "years" figure shown next to the start month in the report
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_sub_code` (`sub_code`),
  KEY `idx_distributor` (`distributor_code`),
  CONSTRAINT `fk_dist_sub_distributor` FOREIGN KEY (`distributor_code`)
    REFERENCES `distribution_distributors` (`code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
