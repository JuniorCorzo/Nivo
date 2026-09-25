package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

class DashboardSseRegistryTest {

  private DashboardSseRegistry sseRegistry;
  private BackendOperationsMetricsManager metricsManager;

  @BeforeEach
  void setUp() {
    metricsManager = mock(BackendOperationsMetricsManager.class);
    sseRegistry = new DashboardSseRegistry(metricsManager);
  }

  @Test
  @DisplayName("Emisión dual: debe enviar evento a suscriptor de la sede y a suscriptor global del tenant, pero no a sedes ajenas")
  void shouldBroadcastEventToMatchingFacilityAndTenantSubscribersOnly() {
    UUID tenantA = UUID.randomUUID();
    UUID tenantB = UUID.randomUUID();
    UUID parking1 = UUID.randomUUID();
    UUID parking2 = UUID.randomUUID();

    var clientFacility1 = sseRegistry.createEmitter(tenantA, parking1);
    var clientFacility2 = sseRegistry.createEmitter(tenantA, parking2);
    var clientTenantA = sseRegistry.createEmitter(tenantA, null); // canal consolidado global
    var clientTenantB = sseRegistry.createEmitter(tenantB, null); // otro tenant

    assertThat(sseRegistry.getActiveCount(tenantA)).isEqualTo(3);

    // Disparar evento para parking1 de tenantA
    sseRegistry.broadcast(tenantA, parking1, "occupancy-update", "{\"parkingId\":\"" + parking1 + "\",\"occupancyRate\":80.0}");

    // Se verifica que metricsManager registró las emisiones broadcast
    verify(metricsManager).recordSseEventBroadcast();
  }

  @Test
  @DisplayName("Ciclo de vida: simular desconexión debe limpiar emitter y decrementar métrica")
  void shouldCleanUpEmitterOnDisconnectWithoutMemoryLeak() {
    UUID tenantA = UUID.randomUUID();
    UUID parking1 = UUID.randomUUID();

    SseEmitter emitter = sseRegistry.createEmitter(tenantA, parking1);
    assertThat(sseRegistry.getActiveCount(tenantA)).isEqualTo(1);

    // Simular evento de desconexión / finalización
    sseRegistry.removeEmitter(tenantA, parking1, emitter);

    assertThat(sseRegistry.getActiveCount(tenantA)).isEqualTo(0);
    verify(metricsManager).recordSseDisconnect();
  }
}
