ALTER TABLE slots
  ADD COLUMN has_charger BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN is_accessible BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX idx_slots_parking_metadata
  ON slots (parking_lot_id, is_active, has_charger, is_accessible);

ALTER TABLE parking_tickets
  ADD COLUMN slot_snapshot JSONB NULL;

COMMENT ON COLUMN parking_tickets.slot_snapshot IS
  'Immutable JSON snapshot of slot attributes at vehicle entry time';
