-- Add plate_country, photo_url, and phone_number to parking_tickets
ALTER TABLE parking_tickets
    ADD COLUMN IF NOT EXISTS plate_country VARCHAR(20) NOT NULL DEFAULT 'CO',
    ADD COLUMN IF NOT EXISTS photo_url TEXT,
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30);

-- Table for sequence generation per parking lot
CREATE TABLE IF NOT EXISTS parking_lot_ticket_sequences (
    parking_lot_id UUID PRIMARY KEY,
    last_sequence BIGINT NOT NULL DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stored function to get next unplated ticket code atomically
CREATE OR REPLACE FUNCTION next_unplated_ticket_code(p_parking_lot_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_seq BIGINT;
    v_target_id UUID;
BEGIN
    v_target_id := COALESCE(p_parking_lot_id, '00000000-0000-0000-0000-000000000000'::UUID);
    INSERT INTO parking_lot_ticket_sequences (parking_lot_id, last_sequence, created_at, updated_at)
    VALUES (v_target_id, 1001, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (parking_lot_id)
    DO UPDATE SET
        last_sequence = parking_lot_ticket_sequences.last_sequence + 1,
        updated_at = CURRENT_TIMESTAMP
    RETURNING last_sequence INTO v_seq;

    RETURN 'SP-' || v_seq;
END;
$$ LANGUAGE plpgsql;
