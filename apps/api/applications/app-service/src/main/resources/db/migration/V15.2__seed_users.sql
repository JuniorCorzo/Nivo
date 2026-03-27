-- Seed users (OWNER para Angel, MANAGER para otros)
-- Seed users
INSERT INTO "nivo_db".nivo.users (id, tenant_id, full_name, email, password, role, contact_info, created_at, updated_at)
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
