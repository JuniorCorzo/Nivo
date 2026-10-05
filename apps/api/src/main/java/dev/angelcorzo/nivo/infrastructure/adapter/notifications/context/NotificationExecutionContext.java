package dev.angelcorzo.nivo.infrastructure.adapter.notifications.context;

import java.util.UUID;

public record NotificationExecutionContext(UUID tenantId, UUID actorUserId) {}

