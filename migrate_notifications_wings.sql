-- Push notification device tokens (per-user targeting, e.g. expired/expiring
-- subscription reminders) + notification history (Notification Master) +
-- Wings: main category (name+image) -> items (caption+description+multi-image).
--
-- Plain CREATE TABLE IF NOT EXISTS (MySQL-safe, no MariaDB-only syntax).

CREATE TABLE IF NOT EXISTS `device_tokens` (
  `id` varchar(100) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `token` varchar(500) NOT NULL,
  `platform` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_token` (`token`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` varchar(100) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `target` varchar(100) DEFAULT NULL,
  `type` varchar(30) DEFAULT 'manual',
  `status` varchar(20) DEFAULT 'sent',
  `recipient_count` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wings_categories` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wings` (
  `id` varchar(100) NOT NULL,
  `category_id` varchar(100) DEFAULT NULL,
  `caption` varchar(500) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wings_images` (
  `id` varchar(100) NOT NULL,
  `wing_id` varchar(100) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_wing` (`wing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
