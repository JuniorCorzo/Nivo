-- Migration: Create analytical dashboard views and composite multi-tenant indexes

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

CREATE INDEX IF NOT EXISTS idx_parking_tickets_tenant_entry
    ON nivo.parking_tickets (tenant_id, entry_time) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_parking_tickets_tenant_exit
    ON nivo.parking_tickets (tenant_id, exit_time) WHERE exit_time IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_slots_tenant_parking_status
    ON nivo.slots (tenant_id, parking_lot_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payments_ticket_status
    ON nivo.payments (parking_ticket_id, status) WHERE deleted_at IS NULL;
