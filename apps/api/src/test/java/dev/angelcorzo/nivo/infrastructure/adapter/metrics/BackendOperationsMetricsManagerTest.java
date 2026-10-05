package dev.angelcorzo.nivo.infrastructure.adapter.metrics;

import static org.assertj.core.api.Assertions.assertThat;

import io.micrometer.core.instrument.Meter;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class BackendOperationsMetricsManagerTest {

  private SimpleMeterRegistry meterRegistry;
  private BackendOperationsMetricsManager metricsManager;

  @BeforeEach
  void setUp() {
    meterRegistry = new SimpleMeterRegistry();
    metricsManager = new BackendOperationsMetricsManager(meterRegistry);
  }

  @Test
  @DisplayName("Gauge de conexiones SSE: debe incrementar al abrir y decrementar al cerrar")
  void shouldTrackSseActiveConnectionsLifecycle() {
    metricsManager.recordSseConnectionOpened();
    metricsManager.recordSseConnectionOpened();
    assertThat(meterRegistry.get("sse.dashboard.active.connections").gauge().value()).isEqualTo(2.0);

    metricsManager.recordSseDisconnect(); // debe decrementar conexiones activas y subir contador de desconexión
    assertThat(meterRegistry.get("sse.dashboard.active.connections").gauge().value()).isEqualTo(1.0);
    assertThat(meterRegistry.get("sse.dashboard.disconnects.total").counter().count()).isEqualTo(1.0);
  }

  @Test
  @DisplayName("Contador de transmisiones SSE: debe acumular eventos broadcast")
  void shouldTrackSseBroadcastEventsAccurately() {
    metricsManager.recordSseEventBroadcast();
    metricsManager.recordSseEventBroadcast();
    metricsManager.recordSseEventBroadcast();
    assertThat(meterRegistry.get("sse.dashboard.events.broadcast.total").counter().count()).isEqualTo(3.0);
  }

  @Test
  @DisplayName("Telemetría de API pública: solicitudes, rate limit y aciertos de caché")
  void shouldTrackPublicApiOperationsAndRateLimits() {
    metricsManager.recordPublicAvailabilityRequest(200);
    metricsManager.recordPublicAvailabilityRequest(200);
    metricsManager.recordPublicAvailabilityRequest(429);
    metricsManager.recordPublicAvailabilityRateLimited();
    metricsManager.recordAvailabilityCacheHit();
    metricsManager.recordAvailabilityCacheMiss();

    assertThat(meterRegistry.get("public.api.availability.requests.total").tag("status", "200").counter().count()).isEqualTo(2.0);
    assertThat(meterRegistry.get("public.api.availability.requests.total").tag("status", "429").counter().count()).isEqualTo(1.0);
    assertThat(meterRegistry.get("public.api.availability.rate_limited.total").counter().count()).isEqualTo(1.0);
    assertThat(meterRegistry.get("public.api.availability.cache.hit").counter().count()).isEqualTo(1.0);
    assertThat(meterRegistry.get("public.api.availability.cache.miss").counter().count()).isEqualTo(1.0);
  }

  @Test
  @DisplayName("Timers de base de datos y CSV: deben registrar latencias con tag de vista")
  void shouldRecordAnalyticsQueryAndCsvExportTimers() {
    metricsManager.recordAnalyticsQueryDuration("hourly", () -> {
      try { Thread.sleep(10); } catch (InterruptedException ignored) {}
    });

    metricsManager.recordCsvExportDuration(() -> {
      try { Thread.sleep(15); } catch (InterruptedException ignored) {}
    });

    final Timer queryTimer = meterRegistry.get("db.analytics.query.duration").tag("view", "hourly").timer();
    assertThat(queryTimer.count()).isEqualTo(1);
    assertThat(queryTimer.totalTime(TimeUnit.MILLISECONDS)).isGreaterThanOrEqualTo(9.0);

    final Timer csvTimer = meterRegistry.get("reports.csv.export.duration").timer();
    assertThat(csvTimer.count()).isEqualTo(1);
  }

  @Test
  @DisplayName("Restricción estricta de cardinalidad: NINGUNA métrica debe incluir tags parkingId, tenantId ni licensePlate")
  void shouldNeverRegisterHighCardinalityTagsInPrometheusMetrics() {
    // Ejecutar varias operaciones de registro
    metricsManager.recordPublicAvailabilityRequest(200);
    metricsManager.recordAnalyticsQueryDuration("daily", () -> {});

    for (final Meter meter : meterRegistry.getMeters()) {
      final List<String> tagKeys = meter.getId().getTags().stream().map(t -> t.getKey().toLowerCase()).toList();
      assertThat(tagKeys)
          .as("Meter '%s' contains high cardinality tags", meter.getId().getName())
          .doesNotContain("parkingid", "tenantid", "licenseplate", "plate", "userid");
    }
  }
}
