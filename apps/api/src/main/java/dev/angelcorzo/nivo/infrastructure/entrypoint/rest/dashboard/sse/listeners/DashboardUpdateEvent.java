package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse.listeners;

import java.util.UUID;

public record DashboardUpdateEvent(UUID tenantId, UUID parkingId, String eventName, Object data) {
}
