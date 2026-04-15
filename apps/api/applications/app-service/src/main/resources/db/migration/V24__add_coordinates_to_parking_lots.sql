CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE parking_lots ADD COLUMN coordinates geography(POINT, 4326);
