CREATE TABLE IF NOT EXISTS notification_logs
(
    id                UUID PRIMARY KEY,
    tenant_id         UUID         NOT NULL REFERENCES "nivo_db".nivo.tenants (id) ON DELETE RESTRICT,
    actor_user_id     UUID         NOT NULL REFERENCES "nivo_db".nivo.users (id) ON DELETE RESTRICT,
    recipient_user_id UUID         REFERENCES "nivo_db".nivo.users (id) ON DELETE SET NULL,
    template_id       UUID         REFERENCES "nivo_db".nivo.notification_templates (id) ON DELETE SET NULL,
    event_type        VARCHAR(50)  NOT NULL CHECK (event_type IN (
                                                              'RESERVATION_CREATED',
                                                              'TICKET_OPENED',
                                                              'TICKET_CLOSED',
                                                              'PAYMENT_COMPLETED',
                                                              'PAYMENT_CHECKOUT',
                                                              'USER_SELF_REGISTERED',
                                                              'USER_INVITED',
                                                              'USER_INVITATION_ACCEPTED',
                                                              'USER_ROLE_ASSIGNED'
        )),
    channel           VARCHAR(20)  NOT NULL CHECK (channel IN ('EMAIL', 'WHATSAPP')),
    recipient         VARCHAR(255) NOT NULL,
    subject           VARCHAR(255),
    body              TEXT,
    status            VARCHAR(20)  NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    error_message     TEXT,
    sent_at           TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_logs_tenant_id ON notification_logs (tenant_id);
CREATE INDEX idx_notification_logs_actor_user_id ON notification_logs (actor_user_id);
CREATE INDEX idx_notification_logs_recipient_user_id ON notification_logs (recipient_user_id);
CREATE INDEX idx_notification_logs_template_id ON notification_logs (template_id);
CREATE INDEX idx_notification_logs_event_type ON notification_logs (event_type);
CREATE INDEX idx_notification_logs_status ON notification_logs (status);
CREATE INDEX idx_notification_logs_created_at ON notification_logs (created_at);
