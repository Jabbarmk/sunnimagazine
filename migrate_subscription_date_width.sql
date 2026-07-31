-- Subscriptions now capture a real day (DD/MM/YYYY in the dashboard), not
-- just month+year. from_month/to_month were varchar(7) (just "YYYY-MM"),
-- too narrow to hold "YYYY-MM-DD" (10 chars). Widen them; app_users'
-- subscription_from/to are already varchar(100), no change needed there.
-- Existing "YYYY-MM" rows are left as-is (still valid, shorter strings) —
-- the app displays them as the 1st of that month, nothing is rewritten.

ALTER TABLE `user_subscriptions` MODIFY COLUMN `from_month` varchar(20) DEFAULT NULL;
ALTER TABLE `user_subscriptions` MODIFY COLUMN `to_month` varchar(20) DEFAULT NULL;
