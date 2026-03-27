CREATE TABLE transactions
(
    id               UUID PRIMARY KEY,
    payment_id       UUID           NOT NULL REFERENCES "nivo_db".nivo.payments (id),
    supplier_ref     VARCHAR(50) UNIQUE,
    transaction_id   VARCHAR(50),
    payment_provider VARCHAR(50)    NOT NULL,
    amount           DECIMAL(10, 2) NOT NULL,
    currency         VARCHAR(10)    NOT NULL,
    status           VARCHAR(20)    NOT NULL,
    gateway_response TEXT,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (supplier_ref, payment_id, status)
);
