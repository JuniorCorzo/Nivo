package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse.listeners;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse.DashboardSseRegistry;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class DashboardDomainEventListenerTest {

  @Test
  @DisplayName("Debe delegar la transmisión de evento SSE al DashboardSseRegistry")
  void shouldDelegateBroadcastToRegistry() {
    DashboardSseRegistry registry = mock(DashboardSseRegistry.class);
    DashboardDomainEventListener listener = new DashboardDomainEventListener(registry);

    UUID tenantId = UUID.randomUUID();
    UUID parkingId = UUID.randomUUID();
    DashboardUpdateEvent event =
        new DashboardUpdateEvent(tenantId, parkingId, "occupancy_updated", "{\"occupancy\": 85}");

    listener.onDashboardUpdate(event);

    verify(registry).broadcast(tenantId, parkingId, "occupancy_updated", "{\"occupancy\": 85}");
  }
}
