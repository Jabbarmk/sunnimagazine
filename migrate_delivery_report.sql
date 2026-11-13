-- Monthly delivery reports: each distributor submits one report per month
-- confirming delivery status for every subscriber on their active list.
-- Run after migrate_distribution.sql and migrate_distributor_login.sql.

CREATE TABLE IF NOT EXISTS `distribution_delivery_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `distributor_code` int(11) NOT NULL,
  `month` char(7) NOT NULL,            -- YYYY-MM
  `note` varchar(1000) DEFAULT NULL,   -- optional general note from the distributor
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dist_month` (`distributor_code`, `month`),
  CONSTRAINT `fk_delivery_distributor` FOREIGN KEY (`distributor_code`)
    REFERENCES `distribution_distributors` (`code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `distribution_delivery_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) NOT NULL,
  `sub_id` int(11) NOT NULL,
  `delivered` tinyint(1) NOT NULL DEFAULT 1,  -- 1 = delivered, 0 = not delivered
  `issue` varchar(500) DEFAULT NULL,           -- reason when not delivered / address problem etc.
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_report_sub` (`report_id`, `sub_id`),
  CONSTRAINT `fk_delivery_report` FOREIGN KEY (`report_id`)
    REFERENCES `distribution_delivery_reports` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_delivery_sub` FOREIGN KEY (`sub_id`)
    REFERENCES `distribution_subscribers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
