-- Fix operating_hours_t composite type column order.
--
-- Root cause: same as V26 — Hibernate @Struct persists fields alphabetically.
-- closeTime < openTime alphabetically, so data was stored as (close_time, open_time)
-- instead of (open_time, close_time).

-- Step 1: Extract existing data by position (stored as: close_time, open_time)
CREATE TEMP TABLE operating_hours_fix AS
SELECT
  id,
  (operating_hours).open_time  AS stored_close,
  (operating_hours).close_time AS stored_open
FROM nivo.parking_lots
WHERE operating_hours IS NOT NULL;

-- Step 2: Drop column
ALTER TABLE nivo.parking_lots DROP COLUMN operating_hours;

-- Step 3: Recreate type with correct order
DROP TYPE nivo.operating_hours_t;

CREATE TYPE nivo.operating_hours_t AS (
  open_time  TIME WITH TIME ZONE,
  close_time TIME WITH TIME ZONE
);

-- Step 4: Re-add column
ALTER TABLE nivo.parking_lots
  ADD COLUMN operating_hours nivo.operating_hours_t;

-- Step 5: Restore data with swapped fields
UPDATE nivo.parking_lots p
SET operating_hours = ROW(
  ohf.stored_open,   -- open_time
  ohf.stored_close   -- close_time
)::nivo.operating_hours_t
FROM operating_hours_fix ohf
WHERE p.id = ohf.id;

DROP TABLE operating_hours_fix;
