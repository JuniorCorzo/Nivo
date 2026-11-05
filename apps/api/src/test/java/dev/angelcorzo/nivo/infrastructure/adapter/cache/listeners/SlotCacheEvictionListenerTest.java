package dev.angelcorzo.nivo.infrastructure.adapter.cache.listeners;

import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.CacheKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.dashboard.sse.listeners.DashboardUpdateEvent;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

@DisplayName("SlotCacheEvictionListener Unit Tests")
class SlotCacheEvictionListenerTest {

  private CacheManager cacheManager;
  private CacheKeyGenerator keyGenerator;
  private Cache cache;
  private SlotCacheEvictionListener listener;

  @BeforeEach
  void setUp() {
    cacheManager = mock(CacheManager.class);
    keyGenerator = mock(CacheKeyGenerator.class);
    cache = mock(Cache.class);
    listener = new SlotCacheEvictionListener(cacheManager, keyGenerator);
  }

  @Test
  @DisplayName("Should evict slot summary cache when event and parkingId are non-null")
  void shouldEvictSlotSummaryCacheWhenEventAndParkingIdPresent() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final DashboardUpdateEvent event = new DashboardUpdateEvent(tenantId, parkingId, "UPDATE", "data");
    final String cacheKey = "tenant:" + tenantId + ":" + parkingId;

    when(cacheManager.getCache(CacheNames.SLOT_SUMMARY.getCacheName())).thenReturn(cache);
    when(keyGenerator.buildKeyForTenant(tenantId, parkingId)).thenReturn(cacheKey);

    listener.onDashboardUpdate(event);

    verify(cacheManager).getCache(CacheNames.SLOT_SUMMARY.getCacheName());
    verify(keyGenerator).buildKeyForTenant(tenantId, parkingId);
    verify(cache).evict(cacheKey);
  }

  @Test
  @DisplayName("Should not evict cache when event is null")
  void shouldNotEvictWhenEventIsNull() {
    listener.onDashboardUpdate(null);

    verifyNoInteractions(cacheManager);
    verifyNoInteractions(keyGenerator);
  }

  @Test
  @DisplayName("Should not evict cache when parkingId is null")
  void shouldNotEvictWhenParkingIdIsNull() {
    final UUID tenantId = UUID.randomUUID();
    final DashboardUpdateEvent event = new DashboardUpdateEvent(tenantId, null, "UPDATE", "data");

    listener.onDashboardUpdate(event);

    verifyNoInteractions(cacheManager);
    verifyNoInteractions(keyGenerator);
  }

  @Test
  @DisplayName("Should not throw when cache bucket is null")
  void shouldNotThrowWhenCacheBucketIsNull() {
    final UUID tenantId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final DashboardUpdateEvent event = new DashboardUpdateEvent(tenantId, parkingId, "UPDATE", "data");

    when(cacheManager.getCache(CacheNames.SLOT_SUMMARY.getCacheName())).thenReturn(null);

    listener.onDashboardUpdate(event);

    verify(cacheManager).getCache(CacheNames.SLOT_SUMMARY.getCacheName());
  }
}
