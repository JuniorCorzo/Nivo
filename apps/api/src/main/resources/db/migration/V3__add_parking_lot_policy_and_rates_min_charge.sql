-- Migration: Add parking lot policy fields (grace period & iva)
ALTER TABLE parking_lots
    ADD COLUMN IF NOT EXISTS grace_period_minutes INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS grace_period_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS iva_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.19;
