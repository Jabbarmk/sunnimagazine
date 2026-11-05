-- Optional user type on the user master: Subscriber, Distributor or Admin (NULL = not set).
-- Run once.
ALTER TABLE `app_users` ADD COLUMN `user_type` varchar(20) DEFAULT NULL;
