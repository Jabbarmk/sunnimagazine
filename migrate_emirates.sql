-- Emirates feature: add emirates column to users + emirate-tagged content.
-- Existing content defaults to 'Global' (visible to everyone).
-- Existing users default to '' (empty → they see only Global until they set one).

ALTER TABLE `app_users`
  ADD COLUMN IF NOT EXISTS `emirates` varchar(50) NOT NULL DEFAULT '';

ALTER TABLE `news`
  ADD COLUMN IF NOT EXISTS `emirates` varchar(50) NOT NULL DEFAULT 'Global';

ALTER TABLE `events`
  ADD COLUMN IF NOT EXISTS `emirates` varchar(50) NOT NULL DEFAULT 'Global';

ALTER TABLE `slides`
  ADD COLUMN IF NOT EXISTS `emirates` varchar(50) NOT NULL DEFAULT 'Global';
