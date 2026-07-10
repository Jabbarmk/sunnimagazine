-- Emirates feature: add emirates column to users + emirate-tagged content.
-- Existing content defaults to 'Global' (visible to everyone).
-- Existing users default to '' (empty → they see only Global until they set one).
--
-- NOTE: plain ADD COLUMN (no "IF NOT EXISTS") because production runs MySQL,
-- which does not support IF NOT EXISTS on ADD COLUMN (that's MariaDB-only).
-- If a column already exists, MySQL errors 1060 (Duplicate column) — harmless;
-- just skip that table.

ALTER TABLE `app_users` ADD COLUMN `emirates` varchar(50) NOT NULL DEFAULT '';
ALTER TABLE `news`      ADD COLUMN `emirates` varchar(50) NOT NULL DEFAULT 'Global';
ALTER TABLE `events`    ADD COLUMN `emirates` varchar(50) NOT NULL DEFAULT 'Global';
ALTER TABLE `slides`    ADD COLUMN `emirates` varchar(50) NOT NULL DEFAULT 'Global';
