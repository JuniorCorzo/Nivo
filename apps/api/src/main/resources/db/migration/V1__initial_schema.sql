-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;

-- Composite Types
CREATE TYPE address_t AS (
    street   VARCHAR(255),
    city     VARCHAR(100),
    state    VARCHAR(100),
    country  VARCHAR(100),
    zip_code VARCHAR(20)
);

CREATE TYPE operating_hours_t AS (
    open_time  TIME WITH TIME ZONE,
    close_time TIME WITH TIME ZONE
);

-- Table: tenants
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE RESTRICT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('SUPERADMIN', 'OWNER', 'MANAGER', 'OPERATOR', 'DRIVER', 'AUDITOR')),
    contact_info TEXT,
    deleted_by UUID REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Table: user_invitations
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    invited_email TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('SUPERADMIN', 'OWNER', 'MANAGER', 'OPERATOR', 'DRIVER', 'AUDITOR')),
    token UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Table: parking_lots
CREATE TABLE IF NOT EXISTS parking_lots (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    location_address address_t NOT NULL,
    coordinates geography(POINT, 4326),
    timezone VARCHAR(50) DEFAULT 'UTC-5',
    currency VARCHAR(10) DEFAULT 'COP',
    operating_hours operating_hours_t,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Table: slots
CREATE TABLE IF NOT EXISTS slots (
    id UUID PRIMARY KEY,
    parking_lot_id UUID NOT NULL REFERENCES parking_lots(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    slot_number VARCHAR(20) NOT NULL,
    type VARCHAR(50) DEFAULT 'CAR' CHECK (type IN ('CAR', 'MOTORCYCLE', 'EV', 'DISABLED')),
    zone VARCHAR(50),
    prefix VARCHAR(20),
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Table: special_policies
CREATE TABLE IF NOT EXISTS special_policies (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    modifies VARCHAR(10) CHECK (modifies IN ('PRICE', 'TIME', 'DISCOUNT', 'SURCHARGE')),
    operation VARCHAR(11) CHECK (operation IN ('SUBTRACT', 'PERCENTAGE', 'SET')),
    value_to_modify NUMERIC(10, 2) CHECK (value_to_modify >= 0),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_percentage CHECK (operation = 'PERCENTAGE' AND (value_to_modify > 0 AND value_to_modify <= 100))
);

-- Table: rates
CREATE TABLE IF NOT EXISTS rates (
    id UUID PRIMARY KEY,
    parking_lot_id UUID NOT NULL REFERENCES parking_lots(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    special_policy_id UUID REFERENCES special_policies(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description VARCHAR(255) NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    time_unit VARCHAR(20) NOT NULL CHECK (time_unit IN ('MINUTES', 'HOURS', 'DAYS')),
    min_charge_time_minutes INTEGER DEFAULT 0,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('CAR', 'MOTORCYCLE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Table: reservations
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE RESTRICT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'COMPLETED')),
    payment_method VARCHAR(50),
    reservation_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Table: parking_tickets
CREATE TABLE IF NOT EXISTS parking_tickets (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE RESTRICT,
    rate_id UUID NOT NULL REFERENCES rates(id) ON DELETE RESTRICT,
    reservation_id UUID REFERENCES reservations(id) ON DELETE RESTRICT,
    license_plate VARCHAR(20),
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    total_to_charge DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'OPEN' NOT NULL CHECK (status IN ('OPEN', 'CLOSED', 'LOST')),
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_parking_ticket_tenant_id UNIQUE (tenant_id, id)
);

-- Table: payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    parking_ticket_id UUID NOT NULL REFERENCES parking_tickets(id) ON DELETE RESTRICT,
    reservation_id UUID REFERENCES reservations(id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('PAY_LINK', 'EFFECTIVE')),
    status VARCHAR(20) DEFAULT 'PENDING_CHECKOUT' CHECK (status IN ('PENDING_CHECKOUT', 'PENDING_PAYMENT', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED')),
    provider VARCHAR(150),
    external_payment_id VARCHAR(100),
    checkout_session_id VARCHAR(100),
    checkout_url TEXT,
    checkout_expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    provider_create_response JSONB CHECK (jsonb_typeof(provider_create_response) = 'object'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    supplier_ref VARCHAR(50) UNIQUE,
    transaction_id VARCHAR(50),
    payment_provider VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    gateway_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (supplier_ref, payment_id, status)
);

-- Table: notification_templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (
        event_type IN (
            'RESERVATION_CREATED',
            'TICKET_OPENED',
            'TICKET_CLOSED',
            'PAYMENT_COMPLETED',
            'PAYMENT_CHECKOUT',
            'USER_SELF_REGISTERED',
            'USER_INVITED',
            'USER_INVITATION_ACCEPTED',
            'USER_ROLE_ASSIGNED'
        )
    ),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('EMAIL', 'WHATSAPP')),
    template_reference VARCHAR(255),
    body TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Table: notification_preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    event_type VARCHAR(50) NOT NULL CHECK (
        event_type IN (
            'RESERVATION_CREATED',
            'TICKET_OPENED',
            'TICKET_CLOSED',
            'PAYMENT_COMPLETED',
            'PAYMENT_CHECKOUT',
            'USER_SELF_REGISTERED',
            'USER_INVITED',
            'USER_INVITATION_ACCEPTED',
            'USER_ROLE_ASSIGNED'
        )
    ),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('EMAIL', 'WHATSAPP')),
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_notification_preference_user_event_channel UNIQUE (user_id, event_type, channel)
);

-- Table: notification_logs
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    actor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL CHECK (
        event_type IN (
            'RESERVATION_CREATED',
            'TICKET_OPENED',
            'TICKET_CLOSED',
            'PAYMENT_COMPLETED',
            'PAYMENT_CHECKOUT',
            'USER_SELF_REGISTERED',
            'USER_INVITED',
            'USER_INVITATION_ACCEPTED',
            'USER_ROLE_ASSIGNED'
        )
    ),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('EMAIL', 'WHATSAPP')),
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    body TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes: users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- Indexes: user_invitations
CREATE INDEX IF NOT EXISTS idx_user_invitations_invited_email ON user_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_tenant_id ON user_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_invited_by ON user_invitations(invited_by);

-- Indexes: parking_lots
CREATE INDEX IF NOT EXISTS idx_parking_lots_tenant_id ON parking_lots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parking_lots_owner_id ON parking_lots(owner_id);

-- Indexes: slots
CREATE INDEX IF NOT EXISTS idx_slots_parking_lot_id ON slots(parking_lot_id);
CREATE INDEX IF NOT EXISTS idx_slots_tenant_id ON slots(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS slots_slot_number_key ON slots (parking_lot_id, slot_number, zone, prefix) WHERE deleted_at IS NULL;

-- Indexes: special_policies
CREATE INDEX IF NOT EXISTS idx_special_policies_tenant_id ON special_policies(tenant_id);

-- Indexes: rates
CREATE INDEX IF NOT EXISTS idx_rates_tenant_id ON rates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rates_parking_lot_id ON rates(parking_lot_id);

-- Indexes: reservations
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_tenant_id ON reservations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_slot_id ON reservations(slot_id);
CREATE INDEX IF NOT EXISTS idx_reservations_reservation_code ON reservations(reservation_code);

-- Indexes: parking_tickets
CREATE INDEX IF NOT EXISTS idx_parking_tickets_tenant_id ON parking_tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parking_tickets_reservation_id ON parking_tickets(reservation_id);
CREATE INDEX IF NOT EXISTS idx_parking_tickets_user_id ON parking_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_parking_tickets_rate_id ON parking_tickets(rate_id);

-- Indexes: payments
CREATE INDEX IF NOT EXISTS idx_payments_ticket ON payments(tenant_id, parking_ticket_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_payment_one_completed_per_ticket ON payments (tenant_id, parking_ticket_id) WHERE status = 'PAID';
CREATE INDEX IF NOT EXISTS idx_payment_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_checkout_session_id ON payments (checkout_session_id) WHERE checkout_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_checkout_expires_at ON payments (checkout_expires_at) WHERE status = 'PENDING_PAYMENT';

-- Indexes: notification_templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_event_type ON notification_templates (event_type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_event_type_channel_active ON notification_templates (event_type, channel) WHERE is_active = TRUE;

-- Indexes: notification_preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_tenant_id ON notification_preferences (tenant_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_event_type ON notification_preferences (event_type);

-- Indexes: notification_logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_tenant_id ON notification_logs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_actor_user_id ON notification_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient_user_id ON notification_logs (recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_template_id ON notification_logs (template_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_event_type ON notification_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs (status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs (created_at);
