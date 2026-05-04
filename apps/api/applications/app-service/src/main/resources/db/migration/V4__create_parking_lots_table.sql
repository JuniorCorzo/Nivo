-- Create operating_hours_t type
CREATE TYPE operating_hours_t AS (
    open_time TIME WITH TIME ZONE,
    close_time TIME WITH TIME ZONE
);

-- Create address_t type
CREATE TYPE address_t AS (
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zip_code VARCHAR(20)
);

-- Tabla de parqueaderos
CREATE TABLE IF NOT EXISTS parking_lots (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    owner_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    location_address address_t NOT NULL,
    total_spots INTEGER NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC-5',
    currency VARCHAR(10) DEFAULT 'COP',
    operating_hours operating_hours_t,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);