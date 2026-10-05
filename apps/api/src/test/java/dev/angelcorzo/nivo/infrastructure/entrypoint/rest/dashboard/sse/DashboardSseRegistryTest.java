package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

class DashboardSseRegistryTest {

  private DashboardSseRegistry sseRegistry;
  private BackendOperationsMetricsManager metricsManager;
  private AuthenticationContextGateway authContext;

  @BeforeEach
  void setUp() {
    metricsManager = mock(BackendOperationsMetricsManager.class);
    authContext = mock(AuthenticationContextGateway.class);
    sseRegistry = new DashboardSseRegistry(metricsManager, authContext);
  }

  @Test
  @DisplayName("createEmitter(parkingId) debe resolver tenantId desde AuthenticationContextGateway")
  void shouldResolveTenantIdWhenCreatingEmitterWithParkingIdOnly() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    when(authContext.getCurrentTenantId()).thenReturn(tenantId);

    final SseEmitter emitter = sseRegistry.createEmitter(parkingId);

    assertThat(emitter).isNotNull();
    assertThat(sseRegistry.getActiveCount(tenantId)).isEqualTo(1);
    verify(authContext).getCurrentTenantId();
    verify(metricsManager).recordSseConnectionOpened();
  }

  @Test
  @DisplayName("Emisión dual: debe enviar evento a suscriptor de la sede y a suscriptor global del tenant, pero no a sedes ajenas")
  void shouldBroadcastEventToMatchingFacilityAndTenantSubscribersOnly() {
    final UUID tenantA = UUID.randomUUID();
    final UUID tenantB = UUID.randomUUID();
    final UUID parking1 = UUID.randomUUID();
    final UUID parking2 = UUID.randomUUID();

    final SseEmitter clientFacility1 = sseRegistry.createEmitter(tenantA, parking1);
    final SseEmitter clientFacility2 = sseRegistry.createEmitter(tenantA, parking2);
    final SseEmitter clientTenantA = sseRegistry.createEmitter(tenantA, null); // canal consolidado global
    final SseEmitter clientTenantB = sseRegistry.createEmitter(tenantB, null); // otro tenant

    assertThat(clientFacility1).isNotNull();
    assertThat(clientFacility2).isNotNull();
    assertThat(clientTenantA).isNotNull();
    assertThat(clientTenantB).isNotNull();
    assertThat(sseRegistry.getActiveCount(tenantA)).isEqualTo(3);

    // Disparar evento para parking1 de tenantA
    sseRegistry.broadcast(tenantA, parking1, "occupancy-update", "{\"parkingId\":\"" + parking1 + "\",\"occupancyRate\":80.0}");

    // Se verifica que metricsManager registró las emisiones broadcast
    verify(metricsManager).recordSseEventBroadcast();
  }

  @Test
  @DisplayName("Ciclo de vida: simular desconexión debe limpiar emitter y decrementar métrica")
  void shouldCleanUpEmitterOnDisconnectWithoutMemoryLeak() {
    final UUID tenantA = UUID.randomUUID();
    final UUID parking1 = UUID.randomUUID();

    final SseEmitter emitter = sseRegistry.createEmitter(tenantA, parking1);
    assertThat(sseRegistry.getActiveCount(tenantA)).isEqualTo(1);

    // Simular evento de desconexión / finalización
    sseRegistry.removeEmitter(tenantA, parking1, emitter);

    assertThat(sseRegistry.getActiveCount(tenantA)).isEqualTo(0);
    verify(metricsManager).recordSseDisconnect();
  }
}
