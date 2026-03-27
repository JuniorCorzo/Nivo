-- Seed slots
INSERT INTO "nivo_db".nivo.slots (id, parking_lot_id, tenant_id, slot_number, type, zone, status,
                                                created_at, updated_at)
VALUES ('95aba6de-dfdb-4fce-8676-62394efffa67', '8e5085e5-6d7c-4319-8901-d457574c7038',
        '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
        '001', 'CAR', 'ZONA_A', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('a6b7c8d9-ef01-2345-6789-0123456789ab', '8e5085e5-6d7c-4319-8901-d457574c7038',
        '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
        '002', 'MOTORCYCLE', 'ZONA_MOTO', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('b7c8d9e0-f012-3456-789a-123456789abc', 'd1e2f3a4-b5c6-7890-def1-234567890abc',
        'b8f2a1c4-7e5d-4a2b-9c8e-123456789abc',
        '101', 'CAR', 'PLANTA_BAJA', 'OCCUPIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('c8d9e0f1-a123-4567-89ab-234567890bcd', 'e2f3a4b5-c6d7-8901-efa2-345678901bcd',
        'c9d3b2e5-8f6e-4b3c-0d9f-234567890bcd',
        '050', 'CAR', 'PISO_2', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
