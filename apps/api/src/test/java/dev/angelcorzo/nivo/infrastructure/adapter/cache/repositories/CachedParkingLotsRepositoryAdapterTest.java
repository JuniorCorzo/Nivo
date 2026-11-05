package dev.angelcorzo.nivo.infrastructure.adapter.cache.repositories;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.CacheKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.ParkingLotsRepositoryAdapter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

@DisplayName("CachedParkingLotsRepositoryAdapter Unit Tests")
class CachedParkingLotsRepositoryAdapterTest {

  private ParkingLotsRepositoryAdapter delegate;
  private CacheManager cacheManager;
  private CacheKeyGenerator keyGenerator;
  private Cache parkingLotsCache;
  private Cache parkingLotsListCache;
  private CachedParkingLotsRepositoryAdapter cachedAdapter;

  @BeforeEach
  void setUp() {
    delegate = mock(ParkingLotsRepositoryAdapter.class);
    cacheManager = mock(CacheManager.class);
    keyGenerator = mock(CacheKeyGenerator.class);
    parkingLotsCache = mock(Cache.class);
    parkingLotsListCache = mock(Cache.class);
    cachedAdapter = new CachedParkingLotsRepositoryAdapter(delegate, cacheManager, keyGenerator);
  }

  @Test
  @DisplayName("Should delegate findById")
  void shouldDelegateFindById() {
    final UUID id = UUID.randomUUID();
    final ParkingLots lot = ParkingLots.builder().id(id).build();
    when(delegate.findById(id)).thenReturn(Optional.of(lot));

    final Optional<ParkingLots> result = cachedAdapter.findById(id);

    assertThat(result).contains(lot);
    verify(delegate).findById(id);
  }

  @Test
  @DisplayName("Should delegate findByTenantId")
  void shouldDelegateFindByTenantId() {
    final UUID tenantId = UUID.randomUUID();
    final ParkingLotListItem item = mock(ParkingLotListItem.class);
    when(delegate.findByTenantId(tenantId)).thenReturn(List.of(item));

    final List<ParkingLotListItem> result = cachedAdapter.findByTenantId(tenantId);

    assertThat(result).containsExactly(item);
    verify(delegate).findByTenantId(tenantId);
  }

  @Test
  @DisplayName("Should save entity and evict both PARKING_LOTS and PARKING_LOTS_LIST")
  void shouldSaveAndEvictBothCaches() {
    final UUID parkingId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final ParkingLots input = ParkingLots.builder()
      .id(parkingId)
      .tenant(TenantReference.builder().id(tenantId).build())
      .build();
    final ParkingLots saved = ParkingLots.builder()
      .id(parkingId)
      .tenant(TenantReference.builder().id(tenantId).build())
      .build();

    when(delegate.save(input)).thenReturn(saved);
    when(cacheManager.getCache(CacheNames.PARKING_LOTS.getCacheName())).thenReturn(parkingLotsCache);
    when(cacheManager.getCache(CacheNames.PARKING_LOTS_LIST.getCacheName())).thenReturn(parkingLotsListCache);
    when(keyGenerator.buildKey(parkingId)).thenReturn("tenant:" + tenantId + ":" + parkingId);
    when(keyGenerator.buildKeyForTenant(tenantId)).thenReturn("tenant:" + tenantId);

    final ParkingLots result = cachedAdapter.save(input);

    assertThat(result).isEqualTo(saved);
    verify(delegate).save(input);
    verify(parkingLotsCache).evict("tenant:" + tenantId + ":" + parkingId);
    verify(parkingLotsListCache).evict("tenant:" + tenantId);
  }

  @Test
  @DisplayName("Should delete entity and evict caches")
  void shouldDeleteAndEvictCaches() {
    final UUID parkingId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final ParkingLots lot = ParkingLots.builder()
      .id(parkingId)
      .tenant(TenantReference.builder().id(tenantId).build())
      .build();

    when(cacheManager.getCache(CacheNames.PARKING_LOTS.getCacheName())).thenReturn(parkingLotsCache);
    when(cacheManager.getCache(CacheNames.PARKING_LOTS_LIST.getCacheName())).thenReturn(parkingLotsListCache);
    when(keyGenerator.buildKey(parkingId)).thenReturn("tenant:" + tenantId + ":" + parkingId);
    when(keyGenerator.buildKeyForTenant(tenantId)).thenReturn("tenant:" + tenantId);

    cachedAdapter.delete(lot);

    verify(delegate).delete(lot);
    verify(parkingLotsCache).evict("tenant:" + tenantId + ":" + parkingId);
    verify(parkingLotsListCache).evict("tenant:" + tenantId);
  }

  @Test
  @DisplayName("Should handle null entity gracefully on delete")
  void shouldHandleNullOnDelete() {
    cachedAdapter.delete(null);

    verifyNoInteractions(delegate);
    verifyNoInteractions(cacheManager);
  }
}
