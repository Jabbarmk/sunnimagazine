-- Per-magazine article ordering. `id` is left untouched; sort_order controls
-- the order articles appear (dashboard + app). Backfilled to the current
-- by-id order so nothing changes visually until an admin reorders.
--
-- Plain ADD COLUMN (no IF NOT EXISTS) — production is MySQL. If it already
-- exists you'll get error 1060 (Duplicate column); harmless, skip it.

ALTER TABLE `articles` ADD COLUMN `sort_order` INT NOT NULL DEFAULT 0;

UPDATE `articles` a
JOIN (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY magazine_id
      ORDER BY CAST(REGEXP_REPLACE(id, '[^0-9]', '') AS UNSIGNED), id
    ) AS rn
  FROM `articles`
) t ON a.id = t.id
SET a.sort_order = t.rn;
