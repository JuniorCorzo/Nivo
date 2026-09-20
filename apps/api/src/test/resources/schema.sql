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
