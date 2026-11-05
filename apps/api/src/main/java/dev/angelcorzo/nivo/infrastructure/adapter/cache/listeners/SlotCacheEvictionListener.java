package dev.angelcorzo.nivo.infrastructure.adapter.cache.listeners;

import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.CacheKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse.listeners.DashboardUpdateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Reactive cache eviction listener.
 *
 * <p>
 * Listens for domain events that alter parking slots or occupancy status and purges the corresponding cached
 * SlotSummary using early returns and strict tenant key formatting.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SlotCacheEvictionListener {

  private final CacheManager cacheManager;
  private final CacheKeyGenerator keyGenerator;

  @EventListener
  public void onDashboardUpdate(final DashboardUpdateEvent event) {
    if (event == null || event.parkingId() == null || event.tenantId() == null) {
      return;
    }
    log.debug("Invalidating SlotSummary cache for parkingId={} from DashboardUpdateEvent", event.parkingId());
    final Cache cache = this.cacheManager.getCache(CacheNames.SLOT_SUMMARY.getCacheName());
    if (cache == null) {
      return;
    }
    final String cacheKey = this.keyGenerator.buildKeyForTenant(event.tenantId(), event.parkingId());
    cache.evict(cacheKey);
  }
}
