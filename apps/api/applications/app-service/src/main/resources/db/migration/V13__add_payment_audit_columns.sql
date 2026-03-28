ALTER TABLE "nivo_db".nivo.payments
    ADD COLUMN provider            VARCHAR(150),
    ADD COLUMN external_payment_id VARCHAR(100),
    ADD COLUMN checkout_session_id VARCHAR(100),
    ADD COLUMN checkout_url        TEXT,
    ADD COLUMN checkout_expires_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN completed_at        TIMESTAMP WITH TIME ZONE;

ALTER TABLE "nivo_db".nivo.payments
    RENAME COLUMN provider_metadata TO provider_create_response;

CREATE UNIQUE INDEX ux_payment_one_completed_per_ticket
    ON "nivo_db".nivo.payments (tenant_id, parking_ticket_id)
    WHERE status = 'PAID';

CREATE INDEX idx_payment_status
    ON "nivo_db".nivo.payments (status);

CREATE INDEX idx_checkout_session_id
    ON "nivo_db".nivo.payments (checkout_session_id)
    WHERE checkout_session_id IS NOT NULL;

CREATE INDEX idx_checkout_expires_at
    ON "nivo_db".nivo.payments (checkout_expires_at)
    WHERE status = 'PENDING_PAYMENT';

