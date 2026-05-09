-- Gulf Sathyadhara Database Schema
-- Run this once on your MySQL server: mysql -u root -p sunnimagazine < schema.sql

CREATE DATABASE IF NOT EXISTS sunnimagazine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sunnimagazine;

CREATE TABLE IF NOT EXISTS magazines (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  month VARCHAR(50),
  year VARCHAR(10),
  cover MEDIUMTEXT,
  description TEXT,
  article_ids JSON,
  is_published TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS authors (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  avatar MEDIUMTEXT
);

CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(100) PRIMARY KEY,
  magazine_id VARCHAR(100),
  title TEXT NOT NULL,
  caption TEXT,
  category VARCHAR(255),
  author VARCHAR(255),
  avatar MEDIUMTEXT,
  date VARCHAR(100),
  read_time VARCHAR(100),
  hero MEDIUMTEXT,
  paragraphs JSON,
  inline_image MEDIUMTEXT,
  inline_image2 MEDIUMTEXT,
  bottom_image MEDIUMTEXT,
  pull_quote TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS slides (
  id VARCHAR(100) PRIMARY KEY,
  image MEDIUMTEXT,
  poster MEDIUMTEXT,
  title VARCHAR(500),
  details TEXT,
  website VARCHAR(500),
  contact TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS galleries (
  id VARCHAR(100) PRIMARY KEY,
  article_id VARCHAR(100) NOT NULL,
  url MEDIUMTEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS art_categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS arts (
  id VARCHAR(100) PRIMARY KEY,
  magazine_id VARCHAR(100),
  art_category_id VARCHAR(100),
  art_category_name VARCHAR(255),
  author_id VARCHAR(100),
  author_name VARCHAR(255),
  author_avatar MEDIUMTEXT,
  title TEXT NOT NULL,
  image MEDIUMTEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_users (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
  mobile VARCHAR(50),
  location VARCHAR(255),
  photo MEDIUMTEXT,
  subscription_from VARCHAR(100),
  subscription_to VARCHAR(100),
  referred_by VARCHAR(255),
  referral_mobile VARCHAR(50),
  is_active TINYINT(1) DEFAULT 1,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  amount_aed DECIMAL(10,2) DEFAULT 0,
  from_month VARCHAR(20),
  to_month VARCHAR(20),
  paid_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_writings (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  art_category_id VARCHAR(100),
  art_category_name VARCHAR(255),
  description TEXT,
  image TEXT,
  sent_at VARCHAR(100),
  status ENUM('pending','reviewed','published') DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS email_settings (
  id INT PRIMARY KEY DEFAULT 1,
  host VARCHAR(255),
  port VARCHAR(10),
  username VARCHAR(255),
  password VARCHAR(255),
  from_name VARCHAR(255),
  admin_email VARCHAR(255),
  whatsapp_template TEXT
);

CREATE TABLE IF NOT EXISTS video_categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS videos (
  id VARCHAR(100) PRIMARY KEY,
  category_id VARCHAR(100),
  category_name VARCHAR(255),
  caption TEXT,
  link TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(500),
  description MEDIUMTEXT,
  poster MEDIUMTEXT,
  event_date VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news_categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS news (
  id VARCHAR(100) PRIMARY KEY,
  category_id VARCHAR(100),
  category_name VARCHAR(255),
  title TEXT NOT NULL,
  description MEDIUMTEXT,
  image MEDIUMTEXT,
  source VARCHAR(500),
  published_at VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticker (
  id INT PRIMARY KEY DEFAULT 1,
  text TEXT,
  is_enabled TINYINT(1) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default admin credentials (email: admin@gulfsathyadhara.com  password: admin123)
CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

INSERT IGNORE INTO admins (email, password) VALUES ('admin@gulfsathyadhara.com', 'admin123');

-- ── ALTER statements for upgrading existing databases ─────────────────────────
-- Run these if the tables already exist and you need to add the new columns:
--
-- ALTER TABLE app_users ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1;
-- ALTER TABLE app_users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL;
-- ALTER TABLE app_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
-- ALTER TABLE email_settings ADD COLUMN IF NOT EXISTS whatsapp_template TEXT;
-- ALTER TABLE slides ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
