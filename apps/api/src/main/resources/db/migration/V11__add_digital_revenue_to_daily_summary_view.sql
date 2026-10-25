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

-- Table-valued function for consolidated dashboard summary calculations
CREATE OR REPLACE FUNCTION nivo.fn_get_dashboard_summary(
    p_tenant_id UUID,
    p_parking_id UUID DEFAULT NULL,
    p_target_date DATE DEFAULT CURRENT_DATE,
    p_comparison_days INT DEFAULT 7
)
RETURNS TABLE (
    scope VARCHAR,
    parking_id UUID,
    total_capacity INT,
    occupied_slots INT,
    available_slots INT,
    occupancy_rate DOUBLE PRECISION,
    today_revenue NUMERIC,
    currency VARCHAR,
    avg_stay_minutes DOUBLE PRECISION,
    total_tickets BIGINT,
    active_tickets BIGINT,
    completed_tickets BIGINT,
    revenue_delta_percentage DOUBLE PRECISION,
    avg_stay_delta_minutes DOUBLE PRECISION,
    digital_payment_ratio DOUBLE PRECISION,
    grace_period_minutes INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_target_date DATE := COALESCE(p_target_date, CURRENT_DATE);
    v_comp_days INT := CASE WHEN p_comparison_days IS NULL OR p_comparison_days <= 0 THEN 7 ELSE p_comparison_days END;
    v_prev_date DATE;
    v_scope VARCHAR;
    v_total_capacity INT := 0;
    v_occupied_slots INT := 0;
    v_available_slots INT := 0;
    v_occupancy_rate DOUBLE PRECISION := 0.0;
    v_today_revenue NUMERIC := 0.00;
    v_today_digital_revenue NUMERIC := 0.00;
    v_total_tickets BIGINT := 0;
    v_ongoing_tickets BIGINT := 0;
    v_completed_tickets BIGINT := 0;
    v_avg_stay_minutes DOUBLE PRECISION := 0.0;
    v_lot_currency VARCHAR := 'COP';
    v_summary_currency VARCHAR;
    v_currency VARCHAR := 'COP';
    v_grace_period INT := NULL;
    v_prev_revenue NUMERIC := 0.00;
    v_prev_avg_stay DOUBLE PRECISION := NULL;
    v_prev_count BIGINT := 0;
    v_revenue_delta_percentage DOUBLE PRECISION := NULL;
    v_avg_stay_delta_minutes DOUBLE PRECISION := NULL;
    v_digital_payment_ratio DOUBLE PRECISION := 0.0;
    v_slot_capacity BIGINT := 0;
    v_slot_occupied BIGINT := 0;
    v_total_spots_sum BIGINT := 0;
BEGIN
    v_prev_date := v_target_date - v_comp_days;
    v_scope := CASE WHEN p_parking_id IS NOT NULL THEN 'SINGLE' ELSE 'GLOBAL' END;

    -- 1. Currency & Grace Period from parking_lots
    IF p_parking_id IS NOT NULL THEN
        SELECT p.currency, p.grace_period_minutes
        INTO v_lot_currency, v_grace_period
        FROM nivo.parking_lots p
        WHERE p.id = p_parking_id AND p.tenant_id = p_tenant_id AND p.deleted_at IS NULL;
    ELSE
        SELECT p.currency
        INTO v_lot_currency
        FROM nivo.parking_lots p
        WHERE p.tenant_id = p_tenant_id AND p.deleted_at IS NULL AND p.currency IS NOT NULL AND p.currency <> ''
        LIMIT 1;
        v_grace_period := NULL;
    END IF;

    IF v_lot_currency IS NULL OR v_lot_currency = '' THEN
        v_lot_currency := 'COP';
    END IF;

    -- 2. Capacity & Current Occupancy from slots and parking_lots
    SELECT
        COALESCE(COUNT(s.id) FILTER (WHERE s.status != 'MAINTENANCE'), 0),
        COALESCE(COUNT(s.id) FILTER (WHERE s.status IN ('OCCUPIED', 'RESERVED')), 0)
    INTO v_slot_capacity, v_slot_occupied
    FROM nivo.slots s
    WHERE s.tenant_id = p_tenant_id
      AND (p_parking_id IS NULL OR s.parking_lot_id = p_parking_id)
      AND s.deleted_at IS NULL;

    SELECT COALESCE(SUM(p.total_spots), 0)
    INTO v_total_spots_sum
    FROM nivo.parking_lots p
    WHERE p.tenant_id = p_tenant_id
      AND (p_parking_id IS NULL OR p.id = p_parking_id)
      AND p.deleted_at IS NULL;

    IF v_slot_capacity > 0 THEN
        v_total_capacity := v_slot_capacity::INT;
        v_occupied_slots := v_slot_occupied::INT;
    ELSE
        v_total_capacity := v_total_spots_sum::INT;
        v_occupied_slots := 0;
    END IF;

    -- 3. Target date metrics from v_parking_daily_summary
    SELECT
        COALESCE(SUM(s.total_revenue), 0.00),
        COALESCE(SUM(s.digital_revenue), 0.00),
        COALESCE(SUM(s.total_tickets), 0),
        COALESCE(SUM(s.ongoing_tickets), 0),
        COALESCE(SUM(s.completed_tickets), 0),
        ROUND(AVG(s.avg_duration_minutes) FILTER (WHERE s.avg_duration_minutes IS NOT NULL AND s.avg_duration_minutes > 0)::NUMERIC, 1)::DOUBLE PRECISION,
        MAX(s.currency)
    INTO
        v_today_revenue,
        v_today_digital_revenue,
        v_total_tickets,
        v_ongoing_tickets,
        v_completed_tickets,
        v_avg_stay_minutes,
        v_summary_currency
    FROM nivo.v_parking_daily_summary s
    WHERE s.tenant_id = p_tenant_id
      AND (p_parking_id IS NULL OR s.parking_lot_id = p_parking_id)
      AND s.summary_date = v_target_date;

    IF v_summary_currency IS NOT NULL AND v_summary_currency <> '' THEN
        v_currency := v_summary_currency;
    ELSE
        v_currency := v_lot_currency;
    END IF;

    IF v_avg_stay_minutes IS NULL THEN
        v_avg_stay_minutes := 0.0;
    END IF;

    -- Occupancy fallback if slots were 0 but ongoing tickets exist
    IF v_occupied_slots = 0 AND v_ongoing_tickets > 0 THEN
        v_occupied_slots := LEAST(v_total_capacity, v_ongoing_tickets::INT);
    END IF;

    v_available_slots := GREATEST(0, v_total_capacity - v_occupied_slots);

    IF v_total_capacity > 0 THEN
        v_occupancy_rate := ROUND(((v_occupied_slots::DOUBLE PRECISION * 100.0) / v_total_capacity)::NUMERIC, 2)::DOUBLE PRECISION;
    ELSE
        v_occupancy_rate := 0.0;
    END IF;

    -- 4. Previous period metrics from v_parking_daily_summary
    SELECT
        COUNT(*),
        COALESCE(SUM(s.total_revenue), 0.00),
        ROUND(AVG(s.avg_duration_minutes) FILTER (WHERE s.avg_duration_minutes IS NOT NULL AND s.avg_duration_minutes > 0)::NUMERIC, 1)::DOUBLE PRECISION
    INTO
        v_prev_count,
        v_prev_revenue,
        v_prev_avg_stay
    FROM nivo.v_parking_daily_summary s
    WHERE s.tenant_id = p_tenant_id
      AND (p_parking_id IS NULL OR s.parking_lot_id = p_parking_id)
      AND s.summary_date = v_prev_date;

    -- 5. Calculate deltas
    IF v_prev_count > 0 THEN
        IF v_prev_revenue > 0 THEN
            v_revenue_delta_percentage := ROUND((((v_today_revenue - v_prev_revenue) / v_prev_revenue) * 100.0)::NUMERIC, 1)::DOUBLE PRECISION;
        ELSIF v_today_revenue > 0 THEN
            v_revenue_delta_percentage := 100.0;
        ELSE
            v_revenue_delta_percentage := 0.0;
        END IF;

        IF v_avg_stay_minutes IS NOT NULL AND v_prev_avg_stay IS NOT NULL THEN
            v_avg_stay_delta_minutes := ROUND((v_avg_stay_minutes - v_prev_avg_stay)::NUMERIC, 1)::DOUBLE PRECISION;
        ELSE
            v_avg_stay_delta_minutes := NULL;
        END IF;
    ELSE
        v_revenue_delta_percentage := NULL;
        v_avg_stay_delta_minutes := NULL;
    END IF;

    -- 6. Digital payment ratio
    IF v_today_revenue > 0 THEN
        v_digital_payment_ratio := ROUND(((v_today_digital_revenue / v_today_revenue) * 100.0)::NUMERIC, 1)::DOUBLE PRECISION;
    ELSE
        v_digital_payment_ratio := 0.0;
    END IF;

    RETURN QUERY
    SELECT
        v_scope,
        p_parking_id,
        v_total_capacity,
        v_occupied_slots,
        v_available_slots,
        v_occupancy_rate,
        v_today_revenue,
        v_currency,
        v_avg_stay_minutes,
        v_total_tickets,
        v_ongoing_tickets,
        v_completed_tickets,
        v_revenue_delta_percentage,
        v_avg_stay_delta_minutes,
        v_digital_payment_ratio,
        v_grace_period;
END;
$$;

