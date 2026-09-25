package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse.listeners;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse.DashboardSseRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DashboardDomainEventListener {

  private final DashboardSseRegistry sseRegistry;

  @EventListener
  public void onDashboardUpdate(DashboardUpdateEvent event) {
    log.debug(
        "Broadcasting DashboardUpdateEvent: tenant={}, parking={}, event={}",
        event.tenantId(),
        event.parkingId(),
        event.eventName());
    sseRegistry.broadcast(event.tenantId(), event.parkingId(), event.eventName(), event.data());
  }
}
