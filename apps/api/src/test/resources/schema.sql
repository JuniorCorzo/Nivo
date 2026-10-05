CREATE DOMAIN IF NOT EXISTS address_t AS ROW(street VARCHAR(255), city VARCHAR(255), state VARCHAR(255), country VARCHAR(255), zip_code VARCHAR(255));
CREATE DOMAIN IF NOT EXISTS operating_hours_t AS ROW(open_time TIME WITH TIME ZONE, close_time TIME WITH TIME ZONE);

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    tenant_id UUID,
    contact_info VARCHAR(255),
    deleted_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS parking_lots (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC-5',
    currency VARCHAR(50) DEFAULT 'COP',
    grace_period_minutes INT DEFAULT 0 NOT NULL,
    grace_period_price DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    iva_rate DECIMAL(10,2) DEFAULT 0.19 NOT NULL,
    location_address address_t,
    coordinates VARCHAR(255),
    operating_hours operating_hours_t,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_parking_owner FOREIGN KEY (owner_id) REFERENCES users(id),
    CONSTRAINT fk_parking_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS slots (
    id UUID PRIMARY KEY,
    parking_lot_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    slot_number VARCHAR(255) NOT NULL,
    zone VARCHAR(255),
    prefix VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    has_charger BOOLEAN DEFAULT FALSE NOT NULL,
    is_accessible BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_slots_parking FOREIGN KEY (parking_lot_id) REFERENCES parking_lots(id),
    CONSTRAINT fk_slots_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS rates (
    id UUID PRIMARY KEY,
    parking_lot_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    price_per_unit DECIMAL(10, 2) NOT NULL,
    time_unit VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_rates_parking FOREIGN KEY (parking_lot_id) REFERENCES parking_lots(id),
    CONSTRAINT fk_rates_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS parking_tickets (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID,
    slot_id UUID NOT NULL,
    rate_id UUID,
    reservation_id UUID,
    license_plate VARCHAR(20),
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    total_to_charge DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'OPEN' NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE,
    slot_snapshot JSON,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID,
    parking_ticket_id UUID NOT NULL,
    reservation_id UUID,
    checkout_session_id VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING_CHECKOUT',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE SCHEMA IF NOT EXISTS nivo;

CREATE SYNONYM IF NOT EXISTS nivo.tenants FOR PUBLIC.tenants;
CREATE SYNONYM IF NOT EXISTS nivo.users FOR PUBLIC.users;
CREATE SYNONYM IF NOT EXISTS nivo.parking_lots FOR PUBLIC.parking_lots;
CREATE SYNONYM IF NOT EXISTS nivo.slots FOR PUBLIC.slots;
CREATE SYNONYM IF NOT EXISTS nivo.rates FOR PUBLIC.rates;
CREATE SYNONYM IF NOT EXISTS nivo.parking_tickets FOR PUBLIC.parking_tickets;
CREATE SYNONYM IF NOT EXISTS nivo.payments FOR PUBLIC.payments;

CREATE OR REPLACE VIEW v_parking_occupancy_hourly AS
WITH all_buckets AS (
    SELECT t.tenant_id, s.parking_lot_id, date_trunc('hour', t.entry_time) AS hour_bucket
    FROM parking_tickets t
    JOIN slots s ON s.id = t.slot_id
    WHERE t.deleted_at IS NULL
    UNION
    SELECT t.tenant_id, s.parking_lot_id, date_trunc('hour', t.exit_time) AS hour_bucket
    FROM parking_tickets t
    JOIN slots s ON s.id = t.slot_id
    WHERE t.exit_time IS NOT NULL AND t.deleted_at IS NULL
),
hourly_buckets AS (
    SELECT
        t.tenant_id,
        s.parking_lot_id,
        date_trunc('hour', t.entry_time) AS hour_bucket,
        COUNT(t.id) AS checkin_count
    FROM parking_tickets t
    JOIN slots s ON s.id = t.slot_id
    WHERE t.deleted_at IS NULL
    GROUP BY t.tenant_id, s.parking_lot_id, date_trunc('hour', t.entry_time)
),
hourly_exits AS (
    SELECT
        t.tenant_id,
        s.parking_lot_id,
        date_trunc('hour', t.exit_time) AS hour_bucket,
        COUNT(t.id) AS checkout_count
    FROM parking_tickets t
    JOIN slots s ON s.id = t.slot_id
    WHERE t.exit_time IS NOT NULL AND t.deleted_at IS NULL
    GROUP BY t.tenant_id, s.parking_lot_id, date_trunc('hour', t.exit_time)
),
slot_capacities AS (
    SELECT
        parking_lot_id,
        COUNT(id) AS total_slots
    FROM slots
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

CREATE OR REPLACE VIEW v_parking_daily_summary AS
SELECT
    s.parking_lot_id,
    p.tenant_id,
    p.name AS parking_name,
    CAST(t.entry_time AS date) AS summary_date,
    COUNT(t.id) AS total_tickets,
    COUNT(CASE WHEN t.status = 'CLOSED' THEN t.id ELSE NULL END) AS completed_tickets,
    COUNT(CASE WHEN t.status = 'OPEN' THEN t.id ELSE NULL END) AS ongoing_tickets,
    COUNT(DISTINCT t.license_plate) AS unique_vehicles,
    COALESCE(SUM(CASE WHEN pay.status = 'PAID' THEN pay.amount ELSE 0 END), 0.00) AS total_revenue,
    ROUND(AVG(CASE WHEN t.status = 'CLOSED' THEN (EXTRACT(EPOCH FROM t.exit_time) - EXTRACT(EPOCH FROM t.entry_time)) / 60.0 ELSE NULL END), 2) AS avg_duration_minutes,
    p.currency
FROM parking_tickets t
JOIN slots s ON s.id = t.slot_id
JOIN parking_lots p ON p.id = s.parking_lot_id
LEFT JOIN payments pay ON pay.parking_ticket_id = t.id AND pay.deleted_at IS NULL
WHERE t.deleted_at IS NULL
GROUP BY s.parking_lot_id, p.tenant_id, p.name, CAST(t.entry_time AS date), p.currency;

CREATE OR REPLACE VIEW v_parking_operational_report AS
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
FROM parking_tickets t
JOIN slots s ON s.id = t.slot_id
JOIN parking_lots p ON p.id = s.parking_lot_id
LEFT JOIN rates r ON r.id = t.rate_id
LEFT JOIN payments pay ON pay.parking_ticket_id = t.id AND pay.deleted_at IS NULL
LEFT JOIN users u ON u.id = t.user_id
WHERE t.deleted_at IS NULL;

CREATE SYNONYM IF NOT EXISTS nivo.v_parking_occupancy_hourly FOR PUBLIC.v_parking_occupancy_hourly;
CREATE SYNONYM IF NOT EXISTS nivo.v_parking_daily_summary FOR PUBLIC.v_parking_daily_summary;
CREATE SYNONYM IF NOT EXISTS nivo.v_parking_operational_report FOR PUBLIC.v_parking_operational_report;

