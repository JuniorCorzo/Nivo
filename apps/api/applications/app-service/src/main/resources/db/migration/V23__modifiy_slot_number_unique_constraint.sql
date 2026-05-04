ALTER TABLE slots
    DROP CONSTRAINT slots_slot_number_key;

ALTER TABLE slots
    ADD CONSTRAINT slots_slot_number_key UNIQUE (parking_lot_id, slot_number, zone, prefix);