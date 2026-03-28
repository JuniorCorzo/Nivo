package dev.angelcorzo.nivo.notifications.context;

import java.util.UUID;

public record NotificationExecutionContext(UUID tenantId, UUID actorUserId) {}

