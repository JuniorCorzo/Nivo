-- user indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- user invitation indexes
CREATE INDEX idx_user_invitations_invited_email ON user_invitations(invited_email);
CREATE INDEX idx_user_invitations_tenant_id ON user_invitations(tenant_id);
CREATE INDEX idx_user_invitations_invited_by ON user_invitations(invited_by);

-- parking lots indexes
CREATE INDEX idx_parking_lots_tenant_id ON parking_lots(tenant_id);
CREATE INDEX idx_parking_lots_owner_id  ON parking_lots(owner_id);

-- slots indexes
CREATE INDEX idx_slots_parking_lot_id ON slots(parking_lot_id);
CREATE INDEX idx_slots_tenant_id ON slots(tenant_id);

-- special policies indexes
CREATE INDEX idx_special_policies_tenant_id ON special_policies(tenant_id);

-- rates indexes
CREATE INDEX idx_rates_tenant_id ON rates(tenant_id);
CREATE INDEX idx_rates_parking_lot_id ON rates(parking_lot_id);

-- reservations indexes
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_tenant_id ON reservations(tenant_id);
CREATE INDEX idx_reservations_slot_id ON reservations(slot_id);
CREATE INDEX idx_reservations_reservation_code ON reservations(reservation_code);

-- parking tickets indexes
CREATE INDEX idx_parking_tickets_tenant_id ON parking_tickets(tenant_id);
CREATE INDEX idx_parking_tickets_reservation_id ON parking_tickets(reservation_id);
CREATE INDEX idx_parking_tickets_user_id ON parking_tickets(user_id);
CREATE INDEX idx_parking_tickets_rate_id ON parking_tickets(rate_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_payments_one_completed_per_ticket ON payments(tenant_id, parking_ticket_id) 
WHERE status = 'COMPLETED';



-- payment indexes
CREATE INDEX IF NOT EXISTS idx_payment_ticket ON payments(tenant_id, parking_ticket_id)