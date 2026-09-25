package dev.angelcorzo.nivo.infrastructure.adapter.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Component;

@Component
public class BackendOperationsMetricsManager {

  private final MeterRegistry meterRegistry;
  private final AtomicInteger activeSseConnections;
  private final Counter sseBroadcastCounter;
  private final Counter sseDisconnectCounter;
  private final Counter rateLimitedCounter;
  private final Counter cacheHitCounter;
  private final Counter cacheMissCounter;
  private final Timer csvExportTimer;

  public BackendOperationsMetricsManager(MeterRegistry meterRegistry) {
    this.meterRegistry = meterRegistry;
    this.activeSseConnections = new AtomicInteger(0);
    this.meterRegistry.gauge("sse.dashboard.active.connections", activeSseConnections);
    this.sseBroadcastCounter = meterRegistry.counter("sse.dashboard.events.broadcast.total");
    this.sseDisconnectCounter = meterRegistry.counter("sse.dashboard.disconnects.total");
    this.rateLimitedCounter = meterRegistry.counter("public.api.availability.rate_limited.total");
    this.cacheHitCounter = meterRegistry.counter("public.api.availability.cache.hit");
    this.cacheMissCounter = meterRegistry.counter("public.api.availability.cache.miss");
    this.csvExportTimer = meterRegistry.timer("reports.csv.export.duration");
  }

  public void recordSseConnectionOpened() {
    activeSseConnections.incrementAndGet();
  }

  public void recordSseConnectionClosed() {
    activeSseConnections.decrementAndGet();
  }

  public void recordSseDisconnect() {
    activeSseConnections.decrementAndGet();
    sseDisconnectCounter.increment();
  }

  public void recordSseEventBroadcast() {
    sseBroadcastCounter.increment();
  }

  public void recordPublicAvailabilityRequest(int statusCode) {
    meterRegistry.counter("public.api.availability.requests.total", "status", String.valueOf(statusCode)).increment();
  }

  public void recordPublicAvailabilityRateLimited() {
    rateLimitedCounter.increment();
  }

  public void recordAvailabilityCacheHit() {
    cacheHitCounter.increment();
  }

  public void recordAvailabilityCacheMiss() {
    cacheMissCounter.increment();
  }

  public void recordAnalyticsQueryDuration(String view, Runnable query) {
    Timer.builder("db.analytics.query.duration")
        .tag("view", view)
        .register(meterRegistry)
        .record(query);
  }

  public void recordCsvExportDuration(Runnable export) {
    csvExportTimer.record(export);
  }

  public void recordPublicAvailabilityLatency(Runnable task) {
    meterRegistry.timer("public.api.availability.latency").record(task);
  }
}
