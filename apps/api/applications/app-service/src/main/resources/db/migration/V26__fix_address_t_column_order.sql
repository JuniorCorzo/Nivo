-- Fix address_t composite type column order.
--
-- Root cause: Hibernate 6+ with @Struct persists @Embeddable fields in alphabetical order
-- of Java field names when no explicit `attributes` order is set.
-- Fields were stored as (city, country, state, street, zip_code) instead of
-- (street, city, state, country, zip_code).
--
-- Fix: @Struct now uses attributes = {"street","city","state","country","zipCode"}.
-- This migration corrects the type definition and repairs existing data.

-- Step 1: Extract existing data by position (stored alphabetically: city, country, state, street, zip_code)
CREATE TEMP TABLE address_fix AS
SELECT
  id,
  (location_address).street  AS stored_city,
  (location_address).city    AS stored_country,
  (location_address).state   AS stored_state,
  (location_address).country AS stored_street,
  (location_address).zip_code AS stored_zip
FROM nivo.parking_lots;

-- Step 2: Drop column (required before dropping the type)
ALTER TABLE nivo.parking_lots DROP COLUMN location_address;

-- Step 3: Recreate type with correct order matching @Struct attributes
DROP TYPE nivo.address_t;

CREATE TYPE nivo.address_t AS (
  street   VARCHAR(255),
  city     VARCHAR(100),
  state    VARCHAR(100),
  country  VARCHAR(100),
  zip_code VARCHAR(20)
);

-- Step 4: Re-add column
ALTER TABLE nivo.parking_lots
  ADD COLUMN location_address nivo.address_t NOT NULL
  DEFAULT ROW('', '', '', '', '')::nivo.address_t;

-- Step 5: Restore data with correct field mapping
-- stored_city=city, stored_country=country, stored_state=state, stored_street=street
UPDATE nivo.parking_lots p
SET location_address = ROW(
  af.stored_street,   -- street
  af.stored_city,     -- city
  af.stored_state,    -- state
  af.stored_country,  -- country
  af.stored_zip       -- zip_code
)::nivo.address_t
FROM address_fix af
WHERE p.id = af.id;

-- Step 6: Cleanup
ALTER TABLE nivo.parking_lots ALTER COLUMN location_address DROP DEFAULT;

DROP TABLE address_fix;
