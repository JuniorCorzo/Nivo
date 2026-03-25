package dev.angelcorzo.neoparking.notifications.context;

import java.util.UUID;

public record NotificationExecutionContext(UUID tenantId, UUID actorUserId) {}

