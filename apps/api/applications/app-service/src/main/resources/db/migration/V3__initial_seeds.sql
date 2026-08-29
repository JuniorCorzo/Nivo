-- Seed: tenants
INSERT INTO tenants (id, company_name, created_at, updated_at)
VALUES ('4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'Angel DEV', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('b8f2a1c4-7e5d-4a2b-9c8e-123456789abc', 'Parqueaderos Bogotá', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('c9d3b2e5-8f6e-4b3c-0d9f-234567890bcd', 'Estacionamientos Medellín', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed: users
INSERT INTO users (id, tenant_id, full_name, email, password, role, contact_info, created_at, updated_at)
VALUES ('bd1b95bf-6584-4421-abe5-c06733e5e722', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'Angel Corzo',
        'angel@nivo.com',
        '$argon2id$v=19$m=16384,t=2,p=1$ayEzdKYeR7EYaoVNRIs9Xg$9YHRNuUE1XSEDugTaxwfpefVywh8rE1kw23ScC3qWcI', 'OWNER',
        'Angel!2003', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'Juan Pérez',
        'juan@nivo.com', '$argon2id$v=19$m=16384,t=2,p=1$dummyhash1', 'MANAGER', '+57 300 1234567',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('b2c3d4e5-a6b7-8901-bcde-f23456789012', 'b8f2a1c4-7e5d-4a2b-9c8e-123456789abc', 'María Gómez',
        'maria@bogota.com', '$argon2id$v=19$m=16384,t=2,p=1$dummyhash2', 'OWNER', 'maria.gomez@email.com',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('c3d4e5f6-b7c8-9012-cdef-345678901234', 'c9d3b2e5-8f6e-4b3c-0d9f-234567890bcd', 'Carlos Rodríguez',
        'carlos@medellin.com', '$argon2id$v=19$m=16384,t=2,p=1$dummyhash3', 'OPERATOR', '+57 301 9876543',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed: parking_lots
INSERT INTO parking_lots (id, tenant_id, owner_id, name, location_address, timezone,
                          currency, operating_hours, created_at, updated_at)
VALUES ('8e5085e5-6d7c-4319-8901-d457574c7038',
        '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
        'bd1b95bf-6584-4421-abe5-c06733e5e722',
        'Angel Parking',
        ROW ('Calle 5 #6-21', 'Cúcuta', 'Norte de Santander', 'Colombia', '530015')::address_t,
        'UTC-5',
        'COP',
        ROW ('22:00:00-05:00', '05:00:00-05:00')::operating_hours_t,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP),
       ('d1e2f3a4-b5c6-7890-def1-234567890abc',
        'b8f2a1c4-7e5d-4a2b-9c8e-123456789abc',
        'b2c3d4e5-a6b7-8901-bcde-f23456789012',
        'Bogotá Centro',
        ROW ('Calle 100 #15-20', 'Bogotá', 'Cundinamarca', 'Colombia', '110111')::address_t,
        'UTC-5',
        'COP',
        ROW ('06:00:00-05:00', '22:00:00-05:00')::operating_hours_t,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP),
       ('e2f3a4b5-c6d7-8901-efa2-345678901bcd',
        'c9d3b2e5-8f6e-4b3c-0d9f-234567890bcd',
        'c3d4e5f6-b7c8-9012-cdef-345678901234',
        'Poblado Medellín',
        ROW ('Carrera 43A #10-50', 'Medellín', 'Antioquia', 'Colombia', '050021')::address_t,
        'UTC-5',
        'COP',
        ROW ('00:00:00-05:00', '23:59:00-05:00')::operating_hours_t,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP);

-- Seed: rates
INSERT INTO rates (id, parking_lot_id, tenant_id, name, description, price_per_unit,
                   time_unit, min_charge_time_minutes, vehicle_type, created_at,
                   updated_at)
VALUES ('4014e6f0-eaf7-45bc-ba23-817bd22a6ad9',
        '8e5085e5-6d7c-4319-8901-d457574c7038',
        '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
        'Tarifa normal', 'Tarifa normal moto', 300.00, 'DAYS', 60, 'MOTORCYCLE',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('5025f7a1-fb08-56cd-bc34-928d33b7b8ea',
        '8e5085e5-6d7c-4319-8901-d457574c7038',
        '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
        'Tarifa carro', 'Hora carro', 1500.00, 'HOURS', 30, 'CAR',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('6136a8b2-ac19-67de-cd45-039e44c8c9fb',
        'd1e2f3a4-b5c6-7890-def1-234567890abc',
        'b8f2a1c4-7e5d-4a2b-9c8e-123456789abc',
        'Bogotá nocturna', 'Noche Bogotá', 8000.00, 'HOURS', 120, 'CAR',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed: slots
INSERT INTO slots (id, parking_lot_id, tenant_id, slot_number, type, zone, status,
                   created_at, updated_at)
VALUES ('95aba6de-dfdb-4fce-8676-62394efffa67',
        '8e5085e5-6d7c-4319-8901-d457574c7038',
        '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
        '001', 'CAR', 'ZONA_A', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('a6b7c8d9-ef01-2345-6789-0123456789ab',
        '8e5085e5-6d7c-4319-8901-d457574c7038',
        '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
        '002', 'MOTORCYCLE', 'ZONA_MOTO', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('b7c8d9e0-f012-3456-789a-123456789abc',
        'd1e2f3a4-b5c6-7890-def1-234567890abc',
        'b8f2a1c4-7e5d-4a2b-9c8e-123456789abc',
        '101', 'CAR', 'PLANTA_BAJA', 'OCCUPIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('c8d9e0f1-a123-4567-89ab-234567890bcd',
        'e2f3a4b5-c6d7-8901-efa2-345678901bcd',
        'c9d3b2e5-8f6e-4b3c-0d9f-234567890bcd',
        '050', 'CAR', 'PISO_2', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed: parking_tickets
INSERT INTO parking_tickets (id, tenant_id, user_id, slot_id, rate_id, license_plate,
                             entry_time, exit_time, total_to_charge, status, created_at,
                             updated_at)
VALUES ('d0edb24b-b41c-44fd-831b-7ce65d783bb5',
        '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
        'bd1b95bf-6584-4421-abe5-c06733e5e722',
        '95aba6de-dfdb-4fce-8676-62394efffa67',
        '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9',
        'ABC-000', '2025-12-08 23:43:42', '2025-12-08 23:43:42.06', 215.00,
        'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('e1f2a3b4-c5d6-7890-abcd-456789012def',
        '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'a6b7c8d9-ef01-2345-6789-0123456789ab',
        '5025f7a1-fb08-56cd-bc34-928d33b7b8ea',
        'XYZ-123', '2026-02-16 10:00:00', NULL, 0.00,
        'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('f2a3b4c5-d6e7-8901-bcde-567890123efa',
        'b8f2a1c4-7e5d-4a2b-9c8e-123456789abc',
        'b2c3d4e5-a6b7-8901-bcde-f23456789012',
        'b7c8d9e0-f012-3456-789a-123456789abc',
        '6136a8b2-ac19-67de-cd45-039e44c8c9fb',
        'LMN-456', '2026-02-16 20:00:00', NULL, 0.00,
        'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('a3b4c5d6-e7f8-9012-cdef-678901234abc',
        '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
        'bd1b95bf-6584-4421-abe5-c06733e5e722',
        '95aba6de-dfdb-4fce-8676-62394efffa67',
        '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9',
        'DEF-789', '2026-02-15 08:00:00', NULL, 0.00,
        'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed: notification_templates
INSERT INTO notification_templates (
    id,
    name,
    event_type,
    channel,
    template_reference,
    body,
    is_active,
    created_at,
    updated_at
) VALUES
(
    'a3f43ba0-173b-4585-ad61-c4f2ef4f7c4d',
    'USER_SELF_REGISTERED_EMAIL',
    'USER_SELF_REGISTERED',
    'EMAIL',
    'd-0a990c47c77c49e2b9527afaaebdd9a3',
    'External SendGrid template for user self-registration notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '1c5624bc-e8c7-49ca-b15e-a7fc698c7b6e',
    'PAYMENT_CHECKOUT_EMAIL',
    'PAYMENT_CHECKOUT',
    'EMAIL',
    'd-1772e690c70647d9a287e1baca323989',
    'External SendGrid template for payment checkout notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '6eef8ee6-bb12-4ee0-b0c9-dd5d72b8e8d2',
    'PAYMENT_COMPLETED_EMAIL',
    'PAYMENT_COMPLETED',
    'EMAIL',
    'd-312592cc021140b6be63c383dce9f046',
    'External SendGrid template for payment completed notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '02d4042d-96af-474b-82da-629d67478400',
    'TICKET_CLOSED_EMAIL',
    'TICKET_CLOSED',
    'EMAIL',
    'd-d48ca34cac094056bd3602cc21684ae0',
    'External SendGrid template for ticket closed notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '67e1b8be-bbc0-4cc5-bd76-512db2e5d4e6',
    'TICKET_OPENED_EMAIL',
    'TICKET_OPENED',
    'EMAIL',
    'd-5fba928e5b7c48a1a757d2daaef601a5',
    'External SendGrid template for ticket opened notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'b2345e90-5c23-49b5-85a9-dd9387b0388b',
    'USER_INVITATION_ACCEPTED_EMAIL',
    'USER_INVITATION_ACCEPTED',
    'EMAIL',
    'd-838d69314d4b48eaa7a8369ff324f3a2',
    'External SendGrid template for user invitation accepted notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'ca4c5d38-3dda-4804-95d3-f92d7d4c91ab',
    'USER_INVITED_EMAIL',
    'USER_INVITED',
    'EMAIL',
    'd-e487660392604f2a97e49c2e91665b47',
    'External SendGrid template for user invited notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '86ca87d8-4f2f-4c57-8045-910fcb19b114',
    'USER_ROLE_ASSIGNED_EMAIL',
    'USER_ROLE_ASSIGNED',
    'EMAIL',
    'd-a7ee033e3b8441df95f7c724d136a7e4',
    'External SendGrid template for user role assigned notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
