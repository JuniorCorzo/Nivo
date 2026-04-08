
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
