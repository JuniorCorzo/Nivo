CREATE TABLE IF NOT EXISTS notification_preferences
(
    id         UUID PRIMARY KEY,
    user_id    UUID        NOT NULL REFERENCES "nivo_db".nivo.users (id) ON DELETE CASCADE,
    tenant_id  UUID        NOT NULL REFERENCES "nivo_db".nivo.tenants (id) ON DELETE RESTRICT,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
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
    channel    VARCHAR(20) NOT NULL CHECK (channel IN ('EMAIL', 'WHATSAPP')),
    is_enabled BOOLEAN     NOT NULL     DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_notification_preference_user_event_channel UNIQUE (user_id, event_type, channel)
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences (user_id);
CREATE INDEX idx_notification_preferences_tenant_id ON notification_preferences (tenant_id);
CREATE INDEX idx_notification_preferences_event_type ON notification_preferences (event_type);
