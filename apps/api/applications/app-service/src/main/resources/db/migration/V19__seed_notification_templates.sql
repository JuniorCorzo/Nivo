INSERT INTO "nivo_db".nivo.notification_templates (
    id,
    name,
    event_type,
    channel,
    template_reference,
    body,
    is_active,
    created_at,
    updated_at
) VALUES
(
    'a3f43ba0-173b-4585-ad61-c4f2ef4f7c4d',
    'USER_SELF_REGISTERED_EMAIL',
    'USER_SELF_REGISTERED',
    'EMAIL',
    'd-0a990c47c77c49e2b9527afaaebdd9a3',
    'External SendGrid template for user self-registration notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '1c5624bc-e8c7-49ca-b15e-a7fc698c7b6e',
    'PAYMENT_CHECKOUT_EMAIL',
    'PAYMENT_CHECKOUT',
    'EMAIL',
    'd-1772e690c70647d9a287e1baca323989',
    'External SendGrid template for payment checkout notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '6eef8ee6-bb12-4ee0-b0c9-dd5d72b8e8d2',
    'PAYMENT_COMPLETED_EMAIL',
    'PAYMENT_COMPLETED',
    'EMAIL',
    'd-312592cc021140b6be63c383dce9f046',
    'External SendGrid template for payment completed notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '02d4042d-96af-474b-82da-629d67478400',
    'TICKET_CLOSED_EMAIL',
    'TICKET_CLOSED',
    'EMAIL',
    'd-d48ca34cac094056bd3602cc21684ae0',
    'External SendGrid template for ticket closed notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '67e1b8be-bbc0-4cc5-bd76-512db2e5d4e6',
    'TICKET_OPENED_EMAIL',
    'TICKET_OPENED',
    'EMAIL',
    'd-5fba928e5b7c48a1a757d2daaef601a5',
    'External SendGrid template for ticket opened notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'b2345e90-5c23-49b5-85a9-dd9387b0388b',
    'USER_INVITATION_ACCEPTED_EMAIL',
    'USER_INVITATION_ACCEPTED',
    'EMAIL',
    'd-838d69314d4b48eaa7a8369ff324f3a2',
    'External SendGrid template for user invitation accepted notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'ca4c5d38-3dda-4804-95d3-f92d7d4c91ab',
    'USER_INVITED_EMAIL',
    'USER_INVITED',
    'EMAIL',
    'd-e487660392604f2a97e49c2e91665b47',
    'External SendGrid template for user invited notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '86ca87d8-4f2f-4c57-8045-910fcb19b114',
    'USER_ROLE_ASSIGNED_EMAIL',
    'USER_ROLE_ASSIGNED',
    'EMAIL',
    'd-a7ee033e3b8441df95f7c724d136a7e4',
    'External SendGrid template for user role assigned notification.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
