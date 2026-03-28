CREATE TABLE
	IF NOT EXISTS notification_templates (
		id UUID PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		event_type VARCHAR(50) NOT NULL CHECK (
			event_type IN (
				'RESERVATION_CREATED',
				'TICKET_OPENED',
				'TICKET_CLOSED',
				'PAYMENT_COMPLETED',
				'PAYMENT_CHECKOUT',
				'USER_SELF_REGISTERED',
				'USER_INVITED',
				'USER_INVITATION_ACCEPTED',
				'USER_ROLE_ASSIGNED'
			)
		),
		channel VARCHAR(20) NOT NULL CHECK (channel IN ('EMAIL', 'WHATSAPP')),
		template_reference VARCHAR(255),
		body TEXT NOT NULL,
		is_active BOOLEAN NOT NULL DEFAULT TRUE,
		created_at TIMESTAMP
		WITH
			TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP
		WITH
			TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			deleted_at TIMESTAMP
		WITH
			TIME ZONE
	);

CREATE INDEX idx_notification_templates_event_type ON notification_templates (event_type);

CREATE INDEX idx_notification_templates_event_type_channel_active ON notification_templates (event_type, channel)
WHERE
	is_active = TRUE;