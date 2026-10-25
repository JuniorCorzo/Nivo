-- Recreate nivo.v_parking_daily_summary view with digital_revenue column
DROP VIEW IF EXISTS nivo.v_parking_daily_summary;

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
    COALESCE(SUM(pay.amount) FILTER (WHERE pay.status = 'PAID' AND pay.payment_method IN ('PAY_LINK', 'CARD')), 0.00) AS digital_revenue,
    ROUND(AVG((EXTRACT(EPOCH FROM t.exit_time) - EXTRACT(EPOCH FROM t.entry_time)) / 60.0) FILTER (WHERE t.status = 'CLOSED'), 2) AS avg_duration_minutes,
    p.currency
FROM nivo.parking_tickets t
JOIN nivo.slots s ON s.id = t.slot_id
JOIN nivo.parking_lots p ON p.id = s.parking_lot_id
LEFT JOIN nivo.payments pay ON pay.parking_ticket_id = t.id AND pay.deleted_at IS NULL
WHERE t.deleted_at IS NULL
GROUP BY s.parking_lot_id, p.tenant_id, p.name, CAST(t.entry_time AS date), p.currency;
