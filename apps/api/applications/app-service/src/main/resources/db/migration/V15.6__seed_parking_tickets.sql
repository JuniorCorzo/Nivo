-- Seed parking tickets (todos sin pagar - OPEN)
INSERT INTO "nivo_db".nivo.parking_tickets (id, tenant_id, user_id, slot_id, rate_id, license_plate,
                                                          entry_time, exit_time, total_to_charge, status, created_at,
                                                          updated_at)
VALUES ('d0edb24b-b41c-44fd-831b-7ce65d783bb5', '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
        'bd1b95bf-6584-4421-abe5-c06733e5e722', '95aba6de-dfdb-4fce-8676-62394efffa67',
        '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'ABC-000', '2025-12-08 23:43:42', '2025-12-08 23:43:42.06', 215.00,
        'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

       ('e1f2a3b4-c5d6-7890-abcd-456789012def', '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'a6b7c8d9-ef01-2345-6789-0123456789ab',
        '5025f7a1-fb08-56cd-bc34-928d33b7b8ea', 'XYZ-123', '2026-02-16 10:00:00', NULL, 0.00, 'OPEN',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

       ('f2a3b4c5-d6e7-8901-bcde-567890123efa', 'b8f2a1c4-7e5d-4a2b-9c8e-123456789abc',
        'b2c3d4e5-a6b7-8901-bcde-f23456789012', 'b7c8d9e0-f012-3456-789a-123456789abc',
        '6136a8b2-ac19-67de-cd45-039e44c8c9fb', 'LMN-456', '2026-02-16 20:00:00', NULL, 0.00, 'OPEN',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

       ('a3b4c5d6-e7f8-9012-cdef-678901234abc', '4a4c63e3-9c5d-4f23-9a94-577710307dc7',
        'bd1b95bf-6584-4421-abe5-c06733e5e722', '95aba6de-dfdb-4fce-8676-62394efffa67',
        '4014e6f0-eaf7-45bc-ba23-817bd22a6ad9', 'DEF-789', '2026-02-15 08:00:00', NULL, 0.00, 'OPEN',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
