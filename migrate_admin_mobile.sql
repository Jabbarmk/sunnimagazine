-- Admin dashboard login now accepts email OR mobile number as the
-- username. Adds a mobile column to admins (optional — existing admins
-- have none set until edited).

ALTER TABLE `admins` ADD COLUMN `mobile` varchar(20) DEFAULT NULL;
