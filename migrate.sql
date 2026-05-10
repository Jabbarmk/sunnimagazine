-- Safe migration: adds missing tables and columns without touching existing data

-- New tables
CREATE TABLE IF NOT EXISTS `ticker` (
  `id` int(11) NOT NULL DEFAULT 1,
  `text` text DEFAULT NULL,
  `is_enabled` tinyint(1) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `ticker` (`id`, `text`, `is_enabled`) VALUES (1, '', 0);

CREATE TABLE IF NOT EXISTS `user_subscriptions` (
  `id` varchar(100) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `amount_aed` decimal(10,2) DEFAULT NULL,
  `from_month` varchar(7) DEFAULT NULL,
  `to_month` varchar(7) DEFAULT NULL,
  `paid_date` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `events` (
  `id` varchar(100) NOT NULL,
  `title` varchar(500) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `poster` mediumtext DEFAULT NULL,
  `event_date` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `news_categories` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `news` (
  `id` varchar(100) NOT NULL,
  `category_id` varchar(100) DEFAULT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  `title` text NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `image` mediumtext DEFAULT NULL,
  `source` varchar(500) DEFAULT NULL,
  `published_at` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_writings` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `art_category_id` varchar(100) DEFAULT NULL,
  `art_category_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `sent_at` varchar(100) DEFAULT NULL,
  `status` enum('pending','reviewed','published') DEFAULT 'pending',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `video_categories` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `videos` (
  `id` varchar(100) NOT NULL,
  `category_id` varchar(100) DEFAULT NULL,
  `category_name` varchar(255) DEFAULT NULL,
  `caption` text DEFAULT NULL,
  `link` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- New columns on existing tables (IF NOT EXISTS = MariaDB/MySQL 10.3+)
ALTER TABLE `magazines`
  ADD COLUMN IF NOT EXISTS `article_ids` longtext DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `is_published` tinyint(1) DEFAULT 1;

ALTER TABLE `app_users`
  ADD COLUMN IF NOT EXISTS `referred_by` varchar(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS `referral_mobile` varchar(50) DEFAULT '',
  ADD COLUMN IF NOT EXISTS `deleted_at` timestamp NULL DEFAULT NULL;

ALTER TABLE `email_settings`
  ADD COLUMN IF NOT EXISTS `whatsapp_template` text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `signup_email_template` text DEFAULT NULL;
