package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.infrastructure.adapter.metrics.BackendOperationsMetricsManager;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@Component
public class DashboardSseRegistry {

  private static final Long EMITTER_TIMEOUT = 30 * 60 * 1000L; // 30 minutes
  private final BackendOperationsMetricsManager metricsManager;
  private final AuthenticationContextGateway authenticationContext;
  private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
  private final ScheduledExecutorService heartbeatScheduler;

  public DashboardSseRegistry(
      final BackendOperationsMetricsManager metricsManager,
      final AuthenticationContextGateway authenticationContext) {
    this.metricsManager = metricsManager;
    this.authenticationContext = authenticationContext;
    this.heartbeatScheduler = Executors.newSingleThreadScheduledExecutor(r -> {
      final Thread t = new Thread(r, "sse-heartbeat");
      t.setDaemon(true);
      return t;
    });
    this.heartbeatScheduler.scheduleAtFixedRate(this::sendHeartbeats, 15, 15, TimeUnit.SECONDS);
  }

  public SseEmitter createEmitter(final UUID parkingId) {
    final UUID tenantId = authenticationContext.getCurrentTenantId();
    return createEmitter(tenantId, parkingId);
  }

  public SseEmitter createEmitter(final UUID tenantId, final UUID parkingId) {
    final SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT);
    final String key = buildKey(tenantId, parkingId);

    emitters.computeIfAbsent(key, k -> new CopyOnWriteArrayList<>()).add(emitter);
    metricsManager.recordSseConnectionOpened();

    emitter.onCompletion(() -> removeEmitter(tenantId, parkingId, emitter));
    emitter.onTimeout(() -> {
      emitter.complete();
      removeEmitter(tenantId, parkingId, emitter);
    });
    emitter.onError(ex -> removeEmitter(tenantId, parkingId, emitter));

    try {
      emitter.send(SseEmitter.event().name("ping").data("{\"status\":\"connected\"}"));
    } catch (IOException e) {
      removeEmitter(tenantId, parkingId, emitter);
    }

    return emitter;
  }

  public void removeEmitter(final UUID tenantId, final UUID parkingId, final SseEmitter emitter) {
    final String key = buildKey(tenantId, parkingId);
    final List<SseEmitter> list = emitters.get(key);
    if (list != null && list.remove(emitter)) {
      metricsManager.recordSseDisconnect();
      if (list.isEmpty()) {
        emitters.remove(key);
      }
    }
  }

  public void broadcast(final UUID tenantId, final UUID parkingId, final String eventName, final Object data) {
    final List<SseEmitter> targetEmitters = new ArrayList<>();

    // 1. Single facility subscribers
    if (parkingId != null) {
      final String facilityKey = buildKey(tenantId, parkingId);
      final List<SseEmitter> facilityList = emitters.get(facilityKey);
      if (facilityList != null) {
        targetEmitters.addAll(facilityList);
      }
    }

    // 2. Tenant-wide consolidated subscribers
    final String tenantKey = buildKey(tenantId, null);
    final List<SseEmitter> tenantList = emitters.get(tenantKey);
    if (tenantList != null) {
      targetEmitters.addAll(tenantList);
    }

    if (targetEmitters.isEmpty()) {
      return;
    }

    metricsManager.recordSseEventBroadcast();

    for (final SseEmitter emitter : targetEmitters) {
      try {
        emitter.send(SseEmitter.event().name(eventName).data(data));
      } catch (final Exception ex) {
        log.debug("Failed to send SSE event to client: {}", ex.getMessage());
        emitter.complete();
      }
    }
  }

  public int getActiveCount(final UUID tenantId) {
    int count = 0;
    final String prefix = tenantId.toString();
    for (final Map.Entry<String, List<SseEmitter>> entry : emitters.entrySet()) {
      if (entry.getKey().startsWith(prefix)) {
        count += entry.getValue().size();
      }
    }
    return count;
  }

  private void sendHeartbeats() {
    for (final Map.Entry<String, List<SseEmitter>> entry : emitters.entrySet()) {
      for (final SseEmitter emitter : entry.getValue()) {
        try {
          emitter.send(SseEmitter.event().name("ping").data("{\"heartbeat\":true}"));
        } catch (final Exception e) {
          emitter.complete();
        }
      }
    }
  }

  private String buildKey(final UUID tenantId, final UUID parkingId) {
    if (parkingId != null) {
      return tenantId.toString() + ":" + parkingId.toString();
    }
    return tenantId.toString();
  }
}
