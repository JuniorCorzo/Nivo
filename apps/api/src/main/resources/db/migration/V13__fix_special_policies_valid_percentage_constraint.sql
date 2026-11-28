-- Migration V13: Fix valid_percentage check constraint on special_policies
-- In V1, the constraint was defined as:
--   CONSTRAINT valid_percentage CHECK (operation = 'PERCENTAGE' AND (value_to_modify > 0 AND value_to_modify <= 100))
-- This rejected any row where operation was 'SET' or 'SUBTRACT', causing constraint violation HTTP 500 errors.
-- We fix it so the percentage range (0 < value <= 100) only applies when operation is 'PERCENTAGE'.

ALTER TABLE nivo.special_policies DROP CONSTRAINT IF EXISTS valid_percentage;

ALTER TABLE nivo.special_policies ADD CONSTRAINT valid_percentage
    CHECK (operation <> 'PERCENTAGE' OR (value_to_modify > 0 AND value_to_modify <= 100));
