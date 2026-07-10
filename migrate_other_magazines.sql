-- "Other Magazines" section: a standalone cover + details + PDF (not tied to articles).
-- Shown on the app home page below Old Prints; tapping a cover opens the PDF.

CREATE TABLE IF NOT EXISTS `other_magazines` (
  `id` varchar(100) NOT NULL,
  `title` varchar(500) DEFAULT NULL,
  `details` mediumtext DEFAULT NULL,
  `cover` mediumtext DEFAULT NULL,          -- base64 image or URL
  `pdf_url` varchar(500) DEFAULT NULL,      -- /uploads/pdfs/xxx.pdf
  `issue_date` varchar(100) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
