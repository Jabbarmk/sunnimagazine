-- Dashboard Users: new optional "Code" field (free text, e.g. member/agent code).

ALTER TABLE `app_users` ADD COLUMN `code` varchar(50) DEFAULT NULL;
