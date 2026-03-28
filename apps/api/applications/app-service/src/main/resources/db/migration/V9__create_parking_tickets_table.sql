CREATE TABLE IF NOT EXISTS parking_tickets (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    slot_id UUID NOT NULL REFERENCES slots(id),
    rate_id UUID NOT NULL REFERENCES rates(id),
    reservation_id UUID REFERENCES reservations(id),
 
    license_plate VARCHAR(20),
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    total_to_charge DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'LOST')),
    
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT uq_parking_ticket_tenant_id UNIQUE(tenant_id, id) 
);
