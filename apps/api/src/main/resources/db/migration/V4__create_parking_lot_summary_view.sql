-- Migration: Create parking lot summaries view replacing heavy repository CTE
CREATE OR REPLACE VIEW nivo.v_parking_lot_summaries AS
WITH
  slot_summary AS (
    SELECT
      s.parking_lot_id,
      s.prefix,
      s.zone,
      s.type AS slot_type,
      COUNT(*) AS slot_count
    FROM
      nivo.slots s
    WHERE s.deleted_at IS NULL
    GROUP BY
      s.parking_lot_id,
      s.prefix,
      s.zone,
      s.type
  ),
  slot_occuppation AS (
    SELECT
      s.parking_lot_id,
      ROUND(
        COUNT(*) FILTER (
          WHERE
            s.status IN ('OCCUPIED', 'RESERVED')
        ) * 100.0 / NULLIF(
          COUNT(*) FILTER (
            WHERE
              (s.status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED'))
          ),
          0
        ),
        2
      ) AS occuppation_rate
    FROM
      nivo.slots s
    WHERE s.deleted_at IS NULL
    GROUP BY
      s.parking_lot_id
  )
SELECT
  p.id                                    AS id,
  p.tenant_id                             AS tenant_id,
  p.name                                  AS name,
  p.currency                              AS currency,
  p.grace_period_minutes                  AS grace_period_minutes,
  p.grace_period_price                    AS grace_period_price,
  p.iva_rate                              AS iva_rate,
  occuppation.occuppation_rate            AS occuppation_rate,
  p.created_at                            AS created_at,
  p.updated_at                            AS updated_at,
  p.deleted_at                            AS deleted_at,
  (p.location_address).street             AS street,
  (p.location_address).city               AS city,
  (p.location_address).state              AS state,
  (p.location_address).country            AS country,
  (p.location_address).zip_code           AS zip_code,
  ST_Y(p.coordinates::geometry)           AS latitude,
  ST_X(p.coordinates::geometry)           AS longitude,
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'prefix',   slot_summary.prefix,
        'zone',     slot_summary.zone,
        'type',     slot_summary.slot_type,
        'count',    slot_summary.slot_count
      )
    ) FILTER (WHERE slot_summary.slot_type IS NOT NULL),
    '[]'::json
  )                                       AS slot_distribution,
  u.full_name                             AS owner_name,
  COALESCE(SUM(slot_summary.slot_count), 0) AS total_capacity,
  (p.operating_hours).open_time::text     AS open_time,
  (p.operating_hours).close_time::text    AS close_time
FROM
  nivo.parking_lots p
  LEFT JOIN nivo.users u ON u.id = p.owner_id
  LEFT JOIN slot_summary ON p.id = slot_summary.parking_lot_id
  LEFT JOIN slot_occuppation occuppation ON p.id = occuppation.parking_lot_id
WHERE
  p.deleted_at IS NULL
GROUP BY
  p.id,
  p.tenant_id,
  p.name,
  p.currency,
  p.grace_period_minutes,
  p.grace_period_price,
  p.iva_rate,
  occuppation.occuppation_rate,
  p.location_address,
  p.coordinates,
  p.created_at,
  p.updated_at,
  p.deleted_at,
  u.full_name,
  p.operating_hours;
