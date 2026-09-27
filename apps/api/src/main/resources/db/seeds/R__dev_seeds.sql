-- ==============================================================================
-- Repeatable Dev Migration: R__dev_seeds.sql
-- Development environment seed data for Nivo (Multi-facility, Tickets, Analytics)
-- ==============================================================================

-- 1. Production Safety Guard
DO $$
BEGIN
    IF current_setting('app.environment', true) = 'production' THEN
        RAISE EXCEPTION 'CRITICAL: Dev seeds cannot be executed in production environment!';
    END IF;
END $$;

-- 2. Seed: Tenants
INSERT INTO tenants (id, company_name, created_at, updated_at)
VALUES
    ('4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'Angel DEV', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b8f2a1c4-7e5d-4a2b-9c8e-123456789abc', 'Parqueaderos Bogotá', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c9d3b2e5-8f6e-4b3c-0d9f-234567890bcd', 'Estacionamientos Medellín', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    updated_at = CURRENT_TIMESTAMP;

-- 3. Seed: Users
INSERT INTO users (id, tenant_id, full_name, email, password, role, contact_info, created_at, updated_at)
VALUES
    ('bd1b95bf-6584-4421-abe5-c06733e5e722', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'Angel Corzo',
     'angel@nivo.com',
     '$argon2id$v=19$m=16384,t=2,p=1$ayEzdKYeR7EYaoVNRIs9Xg$9YHRNuUE1XSEDugTaxwfpefVywh8rE1kw23ScC3qWcI',
     'OWNER', 'Angel!2003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'Juan Pérez',
     'juan@nivo.com',
     '$argon2id$v=19$m=16384,t=2,p=1$ayEzdKYeR7EYaoVNRIs9Xg$9YHRNuUE1XSEDugTaxwfpefVywh8rE1kw23ScC3qWcI',
     'MANAGER', '+57 300 1234567', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c4d5e6f7-a8b9-0123-cdef-456789012345', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'Pedro Cajero',
     'pedro@nivo.com',
     '$argon2id$v=19$m=16384,t=2,p=1$ayEzdKYeR7EYaoVNRIs9Xg$9YHRNuUE1XSEDugTaxwfpefVywh8rE1kw23ScC3qWcI',
     'OPERATOR', '+57 301 5550199', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b2c3d4e5-a6b7-8901-bcde-f23456789012', 'b8f2a1c4-7e5d-4a2b-9c8e-123456789abc', 'María Gómez',
     'maria@bogota.com',
     '$argon2id$v=19$m=16384,t=2,p=1$ayEzdKYeR7EYaoVNRIs9Xg$9YHRNuUE1XSEDugTaxwfpefVywh8rE1kw23ScC3qWcI',
     'OWNER', 'maria.gomez@email.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c3d4e5f6-b7c8-9012-cdef-345678901234', 'c9d3b2e5-8f6e-4b3c-0d9f-234567890bcd', 'Carlos Rodríguez',
     'carlos@medellin.com',
     '$argon2id$v=19$m=16384,t=2,p=1$ayEzdKYeR7EYaoVNRIs9Xg$9YHRNuUE1XSEDugTaxwfpefVywh8rE1kw23ScC3qWcI',
     'OPERATOR', '+57 301 9876543', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    contact_info = EXCLUDED.contact_info,
    updated_at = CURRENT_TIMESTAMP;

-- 4. Seed: Parking Lots
INSERT INTO parking_lots (
    id, tenant_id, owner_id, name, location_address, timezone,
    currency, operating_hours, grace_period_minutes, grace_period_price, iva_rate,
    created_at, updated_at
)
VALUES
    ('8e5085e5-6d7c-4319-8901-d457574c7038',
     '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
     'bd1b95bf-6584-4421-abe5-c06733e5e722',
     'Angel Parking Centro',
     ROW ('Calle 5 #6-21', 'Cúcuta', 'Norte de Santander', 'Colombia', '530015')::address_t,
     'UTC-5', 'COP',
     ROW ('06:00:00-05:00', '22:00:00-05:00')::operating_hours_t,
     15, 0.00, 0.1900,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479',
     '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
     'bd1b95bf-6584-4421-abe5-c06733e5e722',
     'Angel Parking Norte',
     ROW ('Avenida 0 #10-45', 'Cúcuta', 'Norte de Santander', 'Colombia', '530015')::address_t,
     'UTC-5', 'COP',
     ROW ('06:00:00-05:00', '22:00:00-05:00')::operating_hours_t,
     15, 0.00, 0.1900,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1e2f3a4-b5c6-7890-def1-234567890abc',
     'b8f2a1c4-7e5d-4a2b-9c8e-123456789abc',
     'b2c3d4e5-a6b7-8901-bcde-f23456789012',
     'Bogotá Centro',
     ROW ('Calle 100 #15-20', 'Bogotá', 'Cundinamarca', 'Colombia', '110111')::address_t,
     'UTC-5', 'COP',
     ROW ('06:00:00-05:00', '22:00:00-05:00')::operating_hours_t,
     15, 0.00, 0.1900,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('e2f3a4b5-c6d7-8901-efa2-345678901bcd',
     'c9d3b2e5-8f6e-4b3c-0d9f-234567890bcd',
     'c3d4e5f6-b7c8-9012-cdef-345678901234',
     'Poblado Medellín',
     ROW ('Carrera 43A #10-50', 'Medellín', 'Antioquia', 'Colombia', '050021')::address_t,
     'UTC-5', 'COP',
     ROW ('00:00:00-05:00', '23:59:00-05:00')::operating_hours_t,
     15, 0.00, 0.1900,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    location_address = EXCLUDED.location_address,
    operating_hours = EXCLUDED.operating_hours,
    grace_period_minutes = EXCLUDED.grace_period_minutes,
    grace_period_price = EXCLUDED.grace_period_price,
    iva_rate = EXCLUDED.iva_rate,
    updated_at = CURRENT_TIMESTAMP;

-- 5. Seed: Rates
INSERT INTO rates (
    id, parking_lot_id, tenant_id, name, description, price_per_unit,
    time_unit, min_charge_time_minutes, vehicle_type, created_at, updated_at
)
VALUES
    ('4014e6f0-eaf7-45bc-ba23-817bd22a6ad9',
     '8e5085e5-6d7c-4319-8901-d457574c7038',
     '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
     'Tarifa Hora Carro', 'Tarifa por hora automóvil - Centro', 3000.00,
     'HOURS', 30, 'CAR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('5025f7a1-fb08-56cd-bc34-928d33b7b8ea',
     '8e5085e5-6d7c-4319-8901-d457574c7038',
     '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
     'Tarifa Hora Moto', 'Tarifa por hora motocicleta - Centro', 1500.00,
     'HOURS', 30, 'MOTORCYCLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('7247b9c3-bd20-78ef-de56-140f55d9da0c',
     'f47ac10b-58cc-4372-a567-0e02b2c3d479',
     '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
     'Tarifa Hora Carro Norte', 'Tarifa por hora automóvil - Norte', 2800.00,
     'HOURS', 30, 'CAR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('8358cae4-ce31-89fa-ef67-251f66e0eb1d',
     'f47ac10b-58cc-4372-a567-0e02b2c3d479',
     '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
     'Tarifa Hora Moto Norte', 'Tarifa por hora motocicleta - Norte', 1200.00,
     'HOURS', 30, 'MOTORCYCLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('6136a8b2-ac19-67de-cd45-039e44c8c9fb',
     'd1e2f3a4-b5c6-7890-def1-234567890abc',
     'b8f2a1c4-7e5d-4a2b-9c8e-123456789abc',
     'Bogotá nocturna', 'Noche Bogotá', 8000.00,
     'HOURS', 120, 'CAR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_per_unit = EXCLUDED.price_per_unit,
    time_unit = EXCLUDED.time_unit,
    min_charge_time_minutes = EXCLUDED.min_charge_time_minutes,
    vehicle_type = EXCLUDED.vehicle_type,
    updated_at = CURRENT_TIMESTAMP;

-- 6. Seed: Slots
-- Parking Centro: 16 slots (12 CAR in ZONA_A & ZONA_B, 4 MOTO in ZONA_MOTO)
-- 11 OCCUPIED, 5 AVAILABLE
INSERT INTO slots (
    id, parking_lot_id, tenant_id, slot_number, type, zone, prefix,
    status, has_charger, is_accessible, is_active, created_at, updated_at
)
VALUES
    -- Centro ZONA_A (CAR, 6 slots: C01-C06, all OCCUPIED)
    ('95aba6de-dfdb-4fce-8676-62394efffa01', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'C01', 'CAR', 'ZONA_A', 'C', 'OCCUPIED', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('95aba6de-dfdb-4fce-8676-62394efffa02', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'C02', 'CAR', 'ZONA_A', 'C', 'OCCUPIED', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('95aba6de-dfdb-4fce-8676-62394efffa03', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'C03', 'CAR', 'ZONA_A', 'C', 'OCCUPIED', FALSE, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('95aba6de-dfdb-4fce-8676-62394efffa04', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'C04', 'CAR', 'ZONA_A', 'C', 'OCCUPIED', FALSE, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('95aba6de-dfdb-4fce-8676-62394efffa05', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'C05', 'CAR', 'ZONA_A', 'C', 'OCCUPIED', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('95aba6de-dfdb-4fce-8676-62394efffa06', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'C06', 'CAR', 'ZONA_A', 'C', 'OCCUPIED', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Centro ZONA_B (CAR, 6 slots: C07-C09 OCCUPIED, C10-C12 AVAILABLE)
    ('95aba6de-dfdb-4fce-8676-62394efffa07', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'C07', 'CAR', 'ZONA_B', 'C', 'OCCUPIED', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('95aba6de-dfdb-4fce-8676-62394efffa08', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'C08', 'CAR', 'ZONA_B', 'C', 'OCCUPIED', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('95aba6de-dfdb-4fce-8676-62394efffa09', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'C09', 'CAR', 'ZONA_B', 'C', 'OCCUPIED', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('95aba6de-dfdb-4fce-8676-62394efffa10', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'C10', 'CAR', 'ZONA_B', 'C', 'AVAILABLE', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('95aba6de-dfdb-4fce-8676-62394efffa11', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'C11', 'CAR', 'ZONA_B', 'C', 'AVAILABLE', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('95aba6de-dfdb-4fce-8676-62394efffa12', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'C12', 'CAR', 'ZONA_B', 'C', 'AVAILABLE', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Centro ZONA_MOTO (MOTORCYCLE, 4 slots: M01-M02 OCCUPIED, M03-M04 AVAILABLE)
    ('95aba6de-dfdb-4fce-8676-62394efffa21', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'M01', 'MOTORCYCLE', 'ZONA_MOTO', 'M', 'OCCUPIED', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('95aba6de-dfdb-4fce-8676-62394efffa22', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'M02', 'MOTORCYCLE', 'ZONA_MOTO', 'M', 'OCCUPIED', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('95aba6de-dfdb-4fce-8676-62394efffa23', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'M03', 'MOTORCYCLE', 'ZONA_MOTO', 'M', 'AVAILABLE', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('95aba6de-dfdb-4fce-8676-62394efffa24', '8e5085e5-6d7c-4319-8901-d457574c7038', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'M04', 'MOTORCYCLE', 'ZONA_MOTO', 'M', 'AVAILABLE', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Parking Norte: 12 slots (9 CAR in NIVEL_1 & NIVEL_2, 3 MOTO in ZONA_MOTO)
    -- 5 OCCUPIED, 7 AVAILABLE
    -- Norte NIVEL_1 (CAR, 5 slots: N01-N04 OCCUPIED, N05 AVAILABLE)
    ('a5aba6de-dfdb-4fce-8676-62394efffb01', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'N01', 'CAR', 'NIVEL_1', 'N', 'OCCUPIED', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a5aba6de-dfdb-4fce-8676-62394efffb02', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'N02', 'CAR', 'NIVEL_1', 'N', 'OCCUPIED', FALSE, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a5aba6de-dfdb-4fce-8676-62394efffb03', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'N03', 'CAR', 'NIVEL_1', 'N', 'OCCUPIED', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a5aba6de-dfdb-4fce-8676-62394efffb04', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'N04', 'CAR', 'NIVEL_1', 'N', 'OCCUPIED', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a5aba6de-dfdb-4fce-8676-62394efffb05', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'N05', 'CAR', 'NIVEL_1', 'N', 'AVAILABLE', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Norte NIVEL_2 (CAR, 4 slots: N06-N09 AVAILABLE)
    ('a5aba6de-dfdb-4fce-8676-62394efffb06', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'N06', 'CAR', 'NIVEL_2', 'N', 'AVAILABLE', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a5aba6de-dfdb-4fce-8676-62394efffb07', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'N07', 'CAR', 'NIVEL_2', 'N', 'AVAILABLE', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a5aba6de-dfdb-4fce-8676-62394efffb08', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'N08', 'CAR', 'NIVEL_2', 'N', 'AVAILABLE', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a5aba6de-dfdb-4fce-8676-62394efffb09', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'N09', 'CAR', 'NIVEL_2', 'N', 'AVAILABLE', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Norte ZONA_MOTO (MOTORCYCLE, 3 slots: NM01 OCCUPIED, NM02-NM03 AVAILABLE)
    ('a5aba6de-dfdb-4fce-8676-62394efffb21', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'NM01', 'MOTORCYCLE', 'ZONA_MOTO', 'NM', 'OCCUPIED', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a5aba6de-dfdb-4fce-8676-62394efffb22', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'NM02', 'MOTORCYCLE', 'ZONA_MOTO', 'NM', 'AVAILABLE', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a5aba6de-dfdb-4fce-8676-62394efffb23', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'NM03', 'MOTORCYCLE', 'ZONA_MOTO', 'NM', 'AVAILABLE', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Bogotá & Medellín slots for tenant isolation verification
    ('b7c8d9e0-f012-3456-789a-123456789abc', 'd1e2f3a4-b5c6-7890-def1-234567890abc', 'b8f2a1c4-7e5d-4a2b-9c8e-123456789abc', '101', 'CAR', 'PLANTA_BAJA', 'P', 'OCCUPIED', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c8d9e0f1-a123-4567-89ab-234567890bcd', 'e2f3a4b5-c6d7-8901-efa2-345678901bcd', 'c9d3b2e5-8f6e-4b3c-0d9f-234567890bcd', '050', 'CAR', 'PISO_2', 'P', 'AVAILABLE', FALSE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    slot_number = EXCLUDED.slot_number,
    type = EXCLUDED.type,
    zone = EXCLUDED.zone,
    prefix = EXCLUDED.prefix,
    status = EXCLUDED.status,
    has_charger = EXCLUDED.has_charger,
    is_accessible = EXCLUDED.is_accessible,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- 7. Seed: Active Tickets (16 tickets: 11 Centro + 5 Norte, status='OPEN', exit_time IS NULL)
INSERT INTO parking_tickets (
    id, tenant_id, user_id, slot_id, rate_id, license_plate,
    entry_time, exit_time, total_to_charge, status, created_at, updated_at
)
VALUES
    -- 11 Active Tickets for Centro (spread between 3 hours and 20 minutes ago)
    ('b1000000-0000-0000-0000-000000000001', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa01', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'ABC-101',
     CURRENT_TIMESTAMP - INTERVAL '180 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000002', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa02', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'ABC-102',
     CURRENT_TIMESTAMP - INTERVAL '160 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000003', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa03', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'ABC-103',
     CURRENT_TIMESTAMP - INTERVAL '140 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000004', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa04', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'ABC-104',
     CURRENT_TIMESTAMP - INTERVAL '120 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000005', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa05', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'ABC-105',
     CURRENT_TIMESTAMP - INTERVAL '100 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000006', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa06', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'ABC-106',
     CURRENT_TIMESTAMP - INTERVAL '80 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000007', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa07', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'ABC-107',
     CURRENT_TIMESTAMP - INTERVAL '65 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000008', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa08', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'ABC-108',
     CURRENT_TIMESTAMP - INTERVAL '50 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000009', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa09', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'ABC-109',
     CURRENT_TIMESTAMP - INTERVAL '35 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000010', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa21', '5025f7a1-fb08-56cd-bc34-928d33b7b8ea', 'ABC-110',
     CURRENT_TIMESTAMP - INTERVAL '25 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000011', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa22', '5025f7a1-fb08-56cd-bc34-928d33b7b8ea', 'ABC-111',
     CURRENT_TIMESTAMP - INTERVAL '20 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- 5 Active Tickets for Norte (spread between 2 hours and 15 minutes ago)
    ('b1000000-0000-0000-0000-000000000012', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb01', '7247b9c3-bd20-78ef-de56-140f55d9da0c', 'XYZ-201',
     CURRENT_TIMESTAMP - INTERVAL '120 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000013', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb02', '7247b9c3-bd20-78ef-de56-140f55d9da0c', 'XYZ-202',
     CURRENT_TIMESTAMP - INTERVAL '90 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000014', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb03', '7247b9c3-bd20-78ef-de56-140f55d9da0c', 'XYZ-203',
     CURRENT_TIMESTAMP - INTERVAL '60 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000015', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb04', '7247b9c3-bd20-78ef-de56-140f55d9da0c', 'XYZ-204',
     CURRENT_TIMESTAMP - INTERVAL '30 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b1000000-0000-0000-0000-000000000016', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb21', '8358cae4-ce31-89fa-ef67-251f66e0eb1d', 'XYZ-205',
     CURRENT_TIMESTAMP - INTERVAL '15 minutes', NULL, 0.00, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    entry_time = EXCLUDED.entry_time,
    exit_time = EXCLUDED.exit_time,
    status = EXCLUDED.status,
    total_to_charge = EXCLUDED.total_to_charge,
    updated_at = CURRENT_TIMESTAMP;

-- 8. Seed: Completed Tickets for Today (15 Centro + 10 Norte = 25 completed tickets)
INSERT INTO parking_tickets (
    id, tenant_id, user_id, slot_id, rate_id, license_plate,
    entry_time, exit_time, total_to_charge, status, closed_at, created_at, updated_at
)
VALUES
    -- Centro Today Completed (15 tickets)
    ('c1000000-0000-0000-0000-000000000001', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa10', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'COL-301',
     CURRENT_DATE + INTERVAL '6 hours 15 minutes', CURRENT_DATE + INTERVAL '7 hours 45 minutes', 6000.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '7 hours 45 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000002', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa11', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'COL-302',
     CURRENT_DATE + INTERVAL '6 hours 30 minutes', CURRENT_DATE + INTERVAL '8 hours 00 minutes', 6000.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '8 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000003', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa23', '5025f7a1-fb08-56cd-bc34-928d33b7b8ea', 'COL-303',
     CURRENT_DATE + INTERVAL '7 hours 00 minutes', CURRENT_DATE + INTERVAL '8 hours 30 minutes', 3000.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '8 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000004', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa12', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'COL-304',
     CURRENT_DATE + INTERVAL '7 hours 15 minutes', CURRENT_DATE + INTERVAL '9 hours 15 minutes', 6000.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '9 hours 15 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000005', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa10', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'COL-305',
     CURRENT_DATE + INTERVAL '7 hours 30 minutes', CURRENT_DATE + INTERVAL '10 hours 30 minutes', 9000.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '10 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000006', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa24', '5025f7a1-fb08-56cd-bc34-928d33b7b8ea', 'COL-306',
     CURRENT_DATE + INTERVAL '8 hours 00 minutes', CURRENT_DATE + INTERVAL '9 hours 00 minutes', 1500.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '9 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000007', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa11', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'COL-307',
     CURRENT_DATE + INTERVAL '8 hours 30 minutes', CURRENT_DATE + INTERVAL '11 hours 30 minutes', 9000.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '11 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000008', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa12', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'COL-308',
     CURRENT_DATE + INTERVAL '9 hours 00 minutes', CURRENT_DATE + INTERVAL '12 hours 00 minutes', 9000.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '12 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000009', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa23', '5025f7a1-fb08-56cd-bc34-928d33b7b8ea', 'COL-309',
     CURRENT_DATE + INTERVAL '9 hours 30 minutes', CURRENT_DATE + INTERVAL '10 hours 30 minutes', 1500.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '10 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000010', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa10', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'COL-310',
     CURRENT_DATE + INTERVAL '10 hours 00 minutes', CURRENT_DATE + INTERVAL '13 hours 00 minutes', 9000.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '13 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000011', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa11', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'COL-311',
     CURRENT_DATE + INTERVAL '10 hours 30 minutes', CURRENT_DATE + INTERVAL '14 hours 30 minutes', 12000.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '14 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000012', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa24', '5025f7a1-fb08-56cd-bc34-928d33b7b8ea', 'COL-312',
     CURRENT_DATE + INTERVAL '11 hours 00 minutes', CURRENT_DATE + INTERVAL '12 hours 00 minutes', 1500.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '12 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000013', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa12', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'COL-313',
     CURRENT_DATE + INTERVAL '11 hours 30 minutes', CURRENT_DATE + INTERVAL '13 hours 30 minutes', 6000.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '13 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000014', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa10', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'COL-314',
     CURRENT_DATE + INTERVAL '12 hours 00 minutes', CURRENT_DATE + INTERVAL '15 hours 00 minutes', 9000.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '15 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000015', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa11', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'COL-315',
     CURRENT_DATE + INTERVAL '12 hours 30 minutes', CURRENT_DATE + INTERVAL '14 hours 00 minutes', 6000.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '14 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Norte Today Completed (10 tickets)
    ('c1000000-0000-0000-0000-000000000016', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb05', '7247b9c3-bd20-78ef-de56-140f55d9da0c', 'NOR-401',
     CURRENT_DATE + INTERVAL '6 hours 30 minutes', CURRENT_DATE + INTERVAL '8 hours 30 minutes', 5600.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '8 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000017', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb06', '7247b9c3-bd20-78ef-de56-140f55d9da0c', 'NOR-402',
     CURRENT_DATE + INTERVAL '7 hours 00 minutes', CURRENT_DATE + INTERVAL '9 hours 00 minutes', 5600.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '9 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000018', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb22', '8358cae4-ce31-89fa-ef67-251f66e0eb1d', 'NOR-403',
     CURRENT_DATE + INTERVAL '7 hours 30 minutes', CURRENT_DATE + INTERVAL '9 hours 00 minutes', 2400.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '9 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000019', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb07', '7247b9c3-bd20-78ef-de56-140f55d9da0c', 'NOR-404',
     CURRENT_DATE + INTERVAL '8 hours 00 minutes', CURRENT_DATE + INTERVAL '11 hours 00 minutes', 8400.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '11 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000020', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb08', '7247b9c3-bd20-78ef-de56-140f55d9da0c', 'NOR-405',
     CURRENT_DATE + INTERVAL '8 hours 30 minutes', CURRENT_DATE + INTERVAL '10 hours 30 minutes', 5600.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '10 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000021', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb23', '8358cae4-ce31-89fa-ef67-251f66e0eb1d', 'NOR-406',
     CURRENT_DATE + INTERVAL '9 hours 00 minutes', CURRENT_DATE + INTERVAL '10 hours 00 minutes', 1200.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '10 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000022', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb09', '7247b9c3-bd20-78ef-de56-140f55d9da0c', 'NOR-407',
     CURRENT_DATE + INTERVAL '9 hours 30 minutes', CURRENT_DATE + INTERVAL '12 hours 30 minutes', 8400.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '12 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000023', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb05', '7247b9c3-bd20-78ef-de56-140f55d9da0c', 'NOR-408',
     CURRENT_DATE + INTERVAL '10 hours 00 minutes', CURRENT_DATE + INTERVAL '14 hours 00 minutes', 11200.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '14 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000024', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb22', '8358cae4-ce31-89fa-ef67-251f66e0eb1d', 'NOR-409',
     CURRENT_DATE + INTERVAL '10 hours 30 minutes', CURRENT_DATE + INTERVAL '11 hours 30 minutes', 1200.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '11 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000025', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb06', '7247b9c3-bd20-78ef-de56-140f55d9da0c', 'NOR-410',
     CURRENT_DATE + INTERVAL '11 hours 00 minutes', CURRENT_DATE + INTERVAL '13 hours 00 minutes', 5600.00, 'CLOSED',
     CURRENT_DATE + INTERVAL '13 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    entry_time = EXCLUDED.entry_time,
    exit_time = EXCLUDED.exit_time,
    total_to_charge = EXCLUDED.total_to_charge,
    status = EXCLUDED.status,
    closed_at = EXCLUDED.closed_at,
    updated_at = CURRENT_TIMESTAMP;

-- 9. Seed: Completed Tickets for Yesterday (5 Centro + 3 Norte = 8 completed tickets)
INSERT INTO parking_tickets (
    id, tenant_id, user_id, slot_id, rate_id, license_plate,
    entry_time, exit_time, total_to_charge, status, closed_at, created_at, updated_at
)
VALUES
    -- Centro Yesterday Completed (5 tickets)
    ('c1000000-0000-0000-0000-000000000026', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa10', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'YES-501',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '7 hours 00 minutes', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours 00 minutes', 6000.00, 'CLOSED',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000027', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa11', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'YES-502',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '8 hours 30 minutes', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11 hours 30 minutes', 9000.00, 'CLOSED',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000028', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa23', '5025f7a1-fb08-56cd-bc34-928d33b7b8ea', 'YES-503',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '10 hours 00 minutes', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 00 minutes', 3000.00, 'CLOSED',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000029', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa12', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'YES-504',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 00 minutes', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours 00 minutes', 6000.00, 'CLOSED',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000030', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     '95aba6de-dfdb-4fce-8676-62394efffa10', '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'YES-505',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours 00 minutes', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '17 hours 00 minutes', 9000.00, 'CLOSED',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '17 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Norte Yesterday Completed (3 tickets)
    ('c1000000-0000-0000-0000-000000000031', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb07', '7247b9c3-bd20-78ef-de56-140f55d9da0c', 'YES-506',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '8 hours 00 minutes', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '10 hours 00 minutes', 5600.00, 'CLOSED',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '10 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000032', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb23', '8358cae4-ce31-89fa-ef67-251f66e0eb1d', 'YES-507',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '10 hours 30 minutes', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 30 minutes', 2400.00, 'CLOSED',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c1000000-0000-0000-0000-000000000033', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'a5aba6de-dfdb-4fce-8676-62394efffb08', '7247b9c3-bd20-78ef-de56-140f55d9da0c', 'YES-508',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '13 hours 00 minutes', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '16 hours 00 minutes', 8400.00, 'CLOSED',
     CURRENT_DATE - INTERVAL '1 day' + INTERVAL '16 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    entry_time = EXCLUDED.entry_time,
    exit_time = EXCLUDED.exit_time,
    total_to_charge = EXCLUDED.total_to_charge,
    status = EXCLUDED.status,
    closed_at = EXCLUDED.closed_at,
    updated_at = CURRENT_TIMESTAMP;

-- 10. Seed: Payments for Completed Tickets (Today & Yesterday)
INSERT INTO payments (
    id, tenant_id, user_id, parking_ticket_id, amount, payment_date,
    payment_method, status, completed_at, created_at, updated_at
)
VALUES
    -- Centro Today Payments (15 payments)
    ('d1000000-0000-0000-0000-000000000001', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000001', 6000.00, CURRENT_DATE + INTERVAL '7 hours 45 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE + INTERVAL '7 hours 45 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000002', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000002', 6000.00, CURRENT_DATE + INTERVAL '8 hours 00 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE + INTERVAL '8 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000003', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000003', 3000.00, CURRENT_DATE + INTERVAL '8 hours 30 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE + INTERVAL '8 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000004', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000004', 6000.00, CURRENT_DATE + INTERVAL '9 hours 15 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE + INTERVAL '9 hours 15 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000005', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000005', 9000.00, CURRENT_DATE + INTERVAL '10 hours 30 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE + INTERVAL '10 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000006', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000006', 1500.00, CURRENT_DATE + INTERVAL '9 hours 00 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE + INTERVAL '9 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000007', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000007', 9000.00, CURRENT_DATE + INTERVAL '11 hours 30 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE + INTERVAL '11 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000008', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000008', 9000.00, CURRENT_DATE + INTERVAL '12 hours 00 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE + INTERVAL '12 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000009', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000009', 1500.00, CURRENT_DATE + INTERVAL '10 hours 30 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE + INTERVAL '10 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000010', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000010', 9000.00, CURRENT_DATE + INTERVAL '13 hours 00 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE + INTERVAL '13 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000011', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000011', 12000.00, CURRENT_DATE + INTERVAL '14 hours 30 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE + INTERVAL '14 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000012', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000012', 1500.00, CURRENT_DATE + INTERVAL '12 hours 00 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE + INTERVAL '12 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000013', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000013', 6000.00, CURRENT_DATE + INTERVAL '13 hours 30 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE + INTERVAL '13 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000014', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000014', 9000.00, CURRENT_DATE + INTERVAL '15 hours 00 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE + INTERVAL '15 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000015', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000015', 6000.00, CURRENT_DATE + INTERVAL '14 hours 00 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE + INTERVAL '14 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Norte Today Payments (10 payments)
    ('d1000000-0000-0000-0000-000000000016', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000016', 5600.00, CURRENT_DATE + INTERVAL '8 hours 30 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE + INTERVAL '8 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000017', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000017', 5600.00, CURRENT_DATE + INTERVAL '9 hours 00 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE + INTERVAL '9 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000018', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000018', 2400.00, CURRENT_DATE + INTERVAL '9 hours 00 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE + INTERVAL '9 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000019', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000019', 8400.00, CURRENT_DATE + INTERVAL '11 hours 00 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE + INTERVAL '11 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000020', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000020', 5600.00, CURRENT_DATE + INTERVAL '10 hours 30 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE + INTERVAL '10 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000021', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000021', 1200.00, CURRENT_DATE + INTERVAL '10 hours 00 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE + INTERVAL '10 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000022', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000022', 8400.00, CURRENT_DATE + INTERVAL '12 hours 30 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE + INTERVAL '12 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000023', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000023', 11200.00, CURRENT_DATE + INTERVAL '14 hours 00 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE + INTERVAL '14 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000024', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000024', 1200.00, CURRENT_DATE + INTERVAL '11 hours 30 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE + INTERVAL '11 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000025', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000025', 5600.00, CURRENT_DATE + INTERVAL '13 hours 00 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE + INTERVAL '13 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Centro Yesterday Payments (5 payments)
    ('d1000000-0000-0000-0000-000000000026', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000026', 6000.00, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours 00 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000027', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000027', 9000.00, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11 hours 30 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000028', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000028', 3000.00, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 00 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000029', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000029', 6000.00, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours 00 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000030', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000030', 9000.00, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '17 hours 00 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '17 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Norte Yesterday Payments (3 payments)
    ('d1000000-0000-0000-0000-000000000031', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000031', 5600.00, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '10 hours 00 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '10 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000032', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000032', 2400.00, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 30 minutes',
     'PAY_LINK', 'PAID', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours 30 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d1000000-0000-0000-0000-000000000033', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'c4d5e6f7-a8b9-0123-cdef-456789012345',
     'c1000000-0000-0000-0000-000000000033', 8400.00, CURRENT_DATE - INTERVAL '1 day' + INTERVAL '16 hours 00 minutes',
     'EFFECTIVE', 'PAID', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '16 hours 00 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    amount = EXCLUDED.amount,
    payment_date = EXCLUDED.payment_date,
    completed_at = EXCLUDED.completed_at,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

-- 11. Seed: Notification Templates (Preserved from initial seeds)
INSERT INTO notification_templates (
    id, name, event_type, channel, template_reference, body,
    is_active, created_at, updated_at
)
VALUES
    ('a3f43ba0-173b-4585-ad61-c4f2ef4f7c4d',
     'USER_SELF_REGISTERED_EMAIL', 'USER_SELF_REGISTERED', 'EMAIL',
     'd-0a990c47c77c49e2b9527afaaebdd9a3',
     'External SendGrid template for user self-registration notification.',
     TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('1c5624bc-e8c7-49ca-b15e-a7fc698c7b6e',
     'PAYMENT_CHECKOUT_EMAIL', 'PAYMENT_CHECKOUT', 'EMAIL',
     'd-1772e690c70647d9a287e1baca323989',
     'External SendGrid template for payment checkout notification.',
     TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('6eef8ee6-bb12-4ee0-b0c9-dd5d72b8e8d2',
     'PAYMENT_COMPLETED_EMAIL', 'PAYMENT_COMPLETED', 'EMAIL',
     'd-312592cc021140b6be63c383dce9f046',
     'External SendGrid template for payment completed notification.',
     TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('02d4042d-96af-474b-82da-629d67478400',
     'TICKET_CLOSED_EMAIL', 'TICKET_CLOSED', 'EMAIL',
     'd-d48ca34cac094056bd3602cc21684ae0',
     'External SendGrid template for ticket closed notification.',
     TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('67e1b8be-bbc0-4cc5-bd76-512db2e5d4e6',
     'TICKET_OPENED_EMAIL', 'TICKET_OPENED', 'EMAIL',
     'd-5fba928e5b7c48a1a757d2daaef601a5',
     'External SendGrid template for ticket opened notification.',
     TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b2345e90-5c23-49b5-85a9-dd9387b0388b',
     'USER_INVITATION_ACCEPTED_EMAIL', 'USER_INVITATION_ACCEPTED', 'EMAIL',
     'd-838d69314d4b48eaa7a8369ff324f3a2',
     'External SendGrid template for user invitation accepted notification.',
     TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ca4c5d38-3dda-4804-95d3-f92d7d4c91ab',
     'USER_INVITED_EMAIL', 'USER_INVITED', 'EMAIL',
     'd-e487660392604f2a97e49c2e91665b47',
     'External SendGrid template for user invited notification.',
     TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('86ca87d8-4f2f-4c57-8045-910fcb19b114',
     'USER_ROLE_ASSIGNED_EMAIL', 'USER_ROLE_ASSIGNED', 'EMAIL',
     'd-a7ee033e3b8441df95f7c724d136a7e4',
     'External SendGrid template for user role assigned notification.',
     TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
