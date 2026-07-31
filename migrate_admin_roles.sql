-- Multi-admin support: adds a role column. The existing admin (lowest id,
-- i.e. the original account) becomes 'super_admin'; anyone created after
-- this migration defaults to 'admin'. Only super_admin can manage other
-- admin accounts (enforced client-side, matching this app's existing
-- security model — see FIREBASE_PUSH_SETUP.md-style docs for context).
--
-- Passwords are NOT migrated here — /api/auth self-heals plaintext
-- passwords to bcrypt hashes automatically on next successful login, no
-- manual step needed.

ALTER TABLE `admins` ADD COLUMN `role` varchar(20) NOT NULL DEFAULT 'admin';
UPDATE `admins` SET `role` = 'super_admin' ORDER BY `id` ASC LIMIT 1;
