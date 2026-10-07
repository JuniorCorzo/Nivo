-- Migration: V8 - Ensure all analytical, operational views and materialized views exist idempotently

-- 1. Parking lot summaries view
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

-- 2. Parking occupancy hourly view
CREATE OR REPLACE VIEW nivo.v_parking_occupancy_hourly AS
WITH all_buckets AS (
    SELECT t.tenant_id, s.parking_lot_id, date_trunc('hour', t.entry_time) AS hour_bucket
    FROM nivo.parking_tickets t
    JOIN nivo.slots s ON s.id = t.slot_id
    WHERE t.deleted_at IS NULL
    UNION
    SELECT t.tenant_id, s.parking_lot_id, date_trunc('hour', t.exit_time) AS hour_bucket
    FROM nivo.parking_tickets t
    JOIN nivo.slots s ON s.id = t.slot_id
    WHERE t.exit_time IS NOT NULL AND t.deleted_at IS NULL
),
hourly_buckets AS (
    SELECT
        t.tenant_id,
        s.parking_lot_id,
        date_trunc('hour', t.entry_time) AS hour_bucket,
        COUNT(t.id) AS checkin_count
    FROM nivo.parking_tickets t
    JOIN nivo.slots s ON s.id = t.slot_id
    WHERE t.deleted_at IS NULL
    GROUP BY t.tenant_id, s.parking_lot_id, date_trunc('hour', t.entry_time)
),
hourly_exits AS (
    SELECT
        t.tenant_id,
        s.parking_lot_id,
        date_trunc('hour', t.exit_time) AS hour_bucket,
        COUNT(t.id) AS checkout_count
    FROM nivo.parking_tickets t
    JOIN nivo.slots s ON s.id = t.slot_id
    WHERE t.exit_time IS NOT NULL AND t.deleted_at IS NULL
    GROUP BY t.tenant_id, s.parking_lot_id, date_trunc('hour', t.exit_time)
),
slot_capacities AS (
    SELECT
        parking_lot_id,
        COUNT(id) AS total_slots
    FROM nivo.slots
    WHERE deleted_at IS NULL AND status != 'MAINTENANCE'
    GROUP BY parking_lot_id
)
SELECT
    a.tenant_id,
    a.parking_lot_id,
    a.hour_bucket,
    COALESCE(b.checkin_count, 0) AS checkins,
    COALESCE(e.checkout_count, 0) AS checkouts,
    cap.total_slots AS total_capacity,
    ROUND(
        LEAST(100.0, GREATEST(0.0,
            (COALESCE(b.checkin_count, 0) * 100.0) / NULLIF(cap.total_slots, 0)
        )), 2
    ) AS estimated_occupancy_rate
FROM all_buckets a
LEFT JOIN hourly_buckets b
    ON a.parking_lot_id = b.parking_lot_id AND a.hour_bucket = b.hour_bucket
LEFT JOIN hourly_exits e
    ON a.parking_lot_id = e.parking_lot_id AND a.hour_bucket = e.hour_bucket
JOIN slot_capacities cap
    ON cap.parking_lot_id = a.parking_lot_id;

-- 3. Parking daily summary view
CREATE OR REPLACE VIEW nivo.v_parking_daily_summary AS
SELECT
    s.parking_lot_id,
    p.tenant_id,
    p.name AS parking_name,
    CAST(t.entry_time AS date) AS summary_date,
    COUNT(t.id) AS total_tickets,
    COUNT(t.id) FILTER (WHERE t.status = 'CLOSED') AS completed_tickets,
    COUNT(t.id) FILTER (WHERE t.status = 'OPEN') AS ongoing_tickets,
    COUNT(DISTINCT t.license_plate) AS unique_vehicles,
    COALESCE(SUM(pay.amount) FILTER (WHERE pay.status = 'PAID'), 0.00) AS total_revenue,
    ROUND(AVG((EXTRACT(EPOCH FROM t.exit_time) - EXTRACT(EPOCH FROM t.entry_time)) / 60.0) FILTER (WHERE t.status = 'CLOSED'), 2) AS avg_duration_minutes,
    p.currency
FROM nivo.parking_tickets t
JOIN nivo.slots s ON s.id = t.slot_id
JOIN nivo.parking_lots p ON p.id = s.parking_lot_id
LEFT JOIN nivo.payments pay ON pay.parking_ticket_id = t.id AND pay.deleted_at IS NULL
WHERE t.deleted_at IS NULL
GROUP BY s.parking_lot_id, p.tenant_id, p.name, CAST(t.entry_time AS date), p.currency;

-- 4. Parking operational report view
CREATE OR REPLACE VIEW nivo.v_parking_operational_report AS
SELECT
    t.id AS ticket_id,
    t.tenant_id,
    p.id AS parking_lot_id,
    p.name AS parking_name,
    t.license_plate,
    s.slot_number,
    s.zone AS slot_zone,
    s.prefix AS slot_prefix,
    s.type AS slot_type,
    r.name AS rate_name,
    t.entry_time,
    t.exit_time,
    ROUND((EXTRACT(EPOCH FROM COALESCE(t.exit_time, CURRENT_TIMESTAMP)) - EXTRACT(EPOCH FROM t.entry_time)) / 60.0, 1) AS duration_minutes,
    t.status AS ticket_status,
    t.total_to_charge,
    pay.id AS payment_id,
    pay.status AS payment_status,
    pay.payment_method,
    pay.amount AS paid_amount,
    pay.completed_at AS payment_date,
    u.full_name AS operator_or_user_name,
    u.email AS user_email
FROM nivo.parking_tickets t
JOIN nivo.slots s ON s.id = t.slot_id
JOIN nivo.parking_lots p ON p.id = s.parking_lot_id
LEFT JOIN nivo.rates r ON r.id = t.rate_id
LEFT JOIN nivo.payments pay ON pay.parking_ticket_id = t.id AND pay.deleted_at IS NULL
LEFT JOIN nivo.users u ON u.id = t.user_id
WHERE t.deleted_at IS NULL;

-- 5. SaaS tenant economics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS nivo.mv_saas_tenant_economics AS
WITH tenant_lots AS (
    SELECT
        p.tenant_id,
        COUNT(p.id) AS active_lots
    FROM nivo.parking_lots p
    WHERE p.deleted_at IS NULL
    GROUP BY p.tenant_id
),
tenant_slots AS (
    SELECT
        s.tenant_id,
        COUNT(s.id) AS total_slots
    FROM nivo.slots s
    WHERE s.deleted_at IS NULL
    GROUP BY s.tenant_id
),
tenant_monthly_tickets AS (
    SELECT
        pt.tenant_id,
        COUNT(pt.id) AS total_tickets_monthly
    FROM nivo.parking_tickets pt
    WHERE pt.deleted_at IS NULL
      AND pt.created_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days')
    GROUP BY pt.tenant_id
),
tenant_first_ticket AS (
    SELECT
        pt.tenant_id,
        MIN(pt.entry_time) AS first_ticket_time
    FROM nivo.parking_tickets pt
    WHERE pt.deleted_at IS NULL
    GROUP BY pt.tenant_id
),
tenant_monthly_gmv AS (
    SELECT
        pay.tenant_id,
        COALESCE(SUM(pay.amount), 0) AS gmv_monthly
    FROM nivo.payments pay
    WHERE pay.deleted_at IS NULL
      AND pay.status = 'PAID'
      AND pay.created_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days')
    GROUP BY pay.tenant_id
)
SELECT
    t.id AS tenant_id,
    t.company_name AS tenant_name,
    t.created_at AS registration_date,
    COALESCE(tl.active_lots, 0)::BIGINT AS active_lots,
    COALESCE(ts.total_slots, 0)::BIGINT AS total_slots,
    COALESCE(tg.gmv_monthly, 0.00)::NUMERIC(12, 2) AS gmv_monthly,
    COALESCE(tmt.total_tickets_monthly, 0)::BIGINT AS total_tickets_monthly,
    CASE
        WHEN tft.first_ticket_time IS NOT NULL AND tft.first_ticket_time >= t.created_at
        THEN ROUND((EXTRACT(EPOCH FROM (tft.first_ticket_time - t.created_at)) / 86400.0)::NUMERIC, 2)
        WHEN tft.first_ticket_time IS NOT NULL AND tft.first_ticket_time < t.created_at
        THEN 0.00
        ELSE NULL
    END AS time_to_first_value
FROM nivo.tenants t
LEFT JOIN tenant_lots tl ON t.id = tl.tenant_id
LEFT JOIN tenant_slots ts ON t.id = ts.tenant_id
LEFT JOIN tenant_monthly_tickets tmt ON t.id = tmt.tenant_id
LEFT JOIN tenant_first_ticket tft ON t.id = tft.tenant_id
LEFT JOIN tenant_monthly_gmv tg ON t.id = tg.tenant_id
WHERE t.deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_saas_tenant_economics_tenant_id
    ON nivo.mv_saas_tenant_economics (tenant_id);

CREATE OR REPLACE FUNCTION nivo.refresh_saas_tenant_economics()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY nivo.mv_saas_tenant_economics;
END;
$$;
