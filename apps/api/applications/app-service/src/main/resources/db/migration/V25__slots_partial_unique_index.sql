ALTER TABLE slots
    DROP CONSTRAINT slots_slot_number_key;

CREATE UNIQUE INDEX slots_slot_number_key
    ON slots (parking_lot_id, slot_number, zone, prefix)
    WHERE deleted_at IS NULL;
