-- Dashboard Users: Mobile is now entered in local UAE format (0501234567)
-- instead of international (971501234567). Adds a separate whatsapp column
-- that holds the international format, auto-derived from Mobile in the
-- dashboard UI (971 + mobile without the leading 0) — used for the
-- "Send WhatsApp Reminder" wa.me link.

ALTER TABLE `app_users` ADD COLUMN `whatsapp` varchar(20) DEFAULT NULL;
