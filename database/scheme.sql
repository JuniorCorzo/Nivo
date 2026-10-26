
CREATE SCHEMA IF NOT EXISTS nivo;
SET search_path TO nivo;



-- Tabla para gestionar los inquilinos (propietarios de parqueaderos)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de usuarios con roles y referencia al inquilino
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('SUPERADMIN', 'OWNER', 'MANAGER', 'OPERATOR', 'DRIVER', 'AUDITOR')),
    tenant_id UUID REFERENCES tenants(id) ON DELETE RESTRICT, -- Un usuario puede no pertenecer a un inquilino (ej. Superadmin, Driver)
    contact_info TEXT,
    deleted_by UUID REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS user_invitations(
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('MANAGER', 'OPERATOR', 'DRIVER', 'AUDITOR')),
    token UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
    invite_by UUID REFERENCES users(id) ON DELETE RESTRICT, -- User ID of who send invitantion
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operating_hours_t') THEN
        CREATE TYPE operating_hours_t AS (
            open_time TIME WITH TIME ZONE,
            close_time TIME WITH TIME ZONE
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'address_t') THEN
        CREATE TYPE address_t AS (
            street VARCHAR(255),
            city VARCHAR(100),
            state VARCHAR(100),
            country VARCHAR(100),
            zip_code VARCHAR(20)
        );
    END IF;
END $$;


-- Tabla de parqueaderos
CREATE TABLE IF NOT EXISTS parking_lots (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address address_t NOT NULL,
    total_spots INTEGER NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    timezone VARCHAR(50) DEFAULT 'UTC-5',
    currency VARCHAR(10) DEFAULT 'COP',
    operating_hours operating_hours_t,
    grace_period_minutes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de plazas (slots) de cada parqueadero
CREATE TABLE slots (
    id UUID PRIMARY KEY,
    parking_lot_id UUID NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    slot_number VARCHAR(20) NOT NULL,
    type VARCHAR(50) DEFAULT 'car', -- car, motorcycle, ev, disabled
    zone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (parking_lot_id, slot_number)
);

--- type fer special policies

CREATE TABLE IF NOT EXISTS special_policies (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    modifies VARCHAR(10) CHECK (modifies IN ('PRICE', 'TIME', 'DISCOUNT', 'SURCHARGE')),
    operation VARCHAR(11) CHECK (operation IN ( 'SUBTRACT', 'PERCENTAGE', 'SET')),
    value_to_modify NUMERIC(10,2) CHECK(value_to_modify >= 0),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_percentage CHECK (operation = 'PERCENTAGE' AND (value_to_modify > 0 AND value_to_modify <= 100) )
);

-- Tabla de tarifas
CREATE TABLE IF NOT EXISTS rates (
    id UUID PRIMARY KEY,
    parking_lot_id UUID NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description VARCHAR(255) NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    time_unit VARCHAR(20) NOT NULL CHECK (time_unit IN ('MINUTES', 'HOURS', 'DAYS')),
    min_charge_time_minutes INTEGER DEFAULT 0,
    vehicle_type VARCHAR(50) NOT NULL CHECK(vehicle_type IN ('CART', 'MOTORCYCLE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS reservations (
-- Tabla de reservas
    id UUID PRIMARY KEY,
    slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'COMPLETED')),
    payment_method VARCHAR(50),
    reservation_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de tickets de estacionamiento
CREATE TABLE IF NOT EXISTS parking_tickets (
    id UUID PRIMARY KEY,
    slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    special_policies_id UUID REFERENCES special_policies(id) ON DELETE SET NULL,
    license_plate VARCHAR(20),
    plate_country VARCHAR(20) NOT NULL DEFAULT 'CO',
    photo_url TEXT,
    phone_number VARCHAR(30),
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
    rate_id UUID NOT NULL REFERENCES rates(id) ON DELETE SET NULL,
    total_to_charge DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'LOST')),
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS parking_lot_ticket_sequences (
    parking_lot_id UUID PRIMARY KEY,
    last_sequence BIGINT NOT NULL DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos/transacciones
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY,
    ticket_id UUID REFERENCES parking_tickets(id) ON DELETE CASCADE,
    reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL, -- Para pagos de reserva
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL CHECK(payment_method IN ('CARD', 'EFFECTIVE')),
    status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    provider_metadata JSONB CHECK (jsonb_typeof(provider_metadata) = 'object'), -- Ej. ID de transacción de Stripe/PayPal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Vista consolidada de resumen diario de parqueadero
CREATE OR REPLACE VIEW v_parking_daily_summary AS
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
FROM parking_tickets t
JOIN slots s ON s.id = t.slot_id
JOIN parking_lots p ON p.id = s.parking_lot_id
LEFT JOIN payments pay ON pay.parking_ticket_id = t.id AND pay.deleted_at IS NULL
WHERE t.deleted_at IS NULL
GROUP BY s.parking_lot_id, p.tenant_id, p.name, CAST(t.entry_time AS date), p.currency;

-- Table-valued function for consolidated dashboard summary calculations
CREATE OR REPLACE FUNCTION fn_get_dashboard_summary(
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
        FROM parking_lots p
        WHERE p.id = p_parking_id AND p.tenant_id = p_tenant_id AND p.deleted_at IS NULL;
    ELSE
        SELECT p.currency
        INTO v_lot_currency
        FROM parking_lots p
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
    FROM slots s
    WHERE s.tenant_id = p_tenant_id
      AND (p_parking_id IS NULL OR s.parking_lot_id = p_parking_id)
      AND s.deleted_at IS NULL;

    SELECT COALESCE(SUM(p.total_spots), 0)
    INTO v_total_spots_sum
    FROM parking_lots p
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
    FROM v_parking_daily_summary s
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
    FROM v_parking_daily_summary s
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


