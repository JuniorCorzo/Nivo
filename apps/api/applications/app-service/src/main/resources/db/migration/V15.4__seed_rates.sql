-- Seed rates
INSERT INTO "nivo_db".nivo.rates (id, parking_lot_id, tenant_id, name, description, price_per_unit,
                                                time_unit, min_charge_time_minutes, vehicle_type, created_at,
                                                updated_at)
VALUES ('4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', '8e5085e5-6d7c-4319-8901-d457574c7038',
        '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'Tarifa normal', 'Tarifa normal moto', 300.00, 'DAYS', 60, 'MOTORCYCLE',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

       ('5025f7a1-fb08-56cd-bc34-928d33b7b8ea', '8e5085e5-6d7c-4319-8901-d457574c7038',
        '4a4c63e3-9c5d-4f23-9a94-577710307dc7', 'Tarifa carro', 'Hora carro', 1500.00, 'HOURS', 30, 'CAR',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ('6136a8b2-ac19-67de-cd45-039e44c8c9fb', 'd1e2f3a4-b5c6-7890-def1-234567890abc',
        'b8f2a1c4-7e5d-4a2b-9c8e-123456789abc', 'Bogotá nocturna', 'Noche Bogotá', 8000.00, 'HOURS', 120, 'CAR',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
