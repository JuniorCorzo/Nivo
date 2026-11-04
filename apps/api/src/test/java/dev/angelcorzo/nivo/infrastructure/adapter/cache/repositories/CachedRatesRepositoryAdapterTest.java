package dev.angelcorzo.nivo.infrastructure.adapter.cache.repositories;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkinglots.valueobject.ParkingLotsReference;
import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.TenantAwareKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.rates.RatesRepositoryAdapter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

@DisplayName("CachedRatesRepositoryAdapter Unit Tests")
class CachedRatesRepositoryAdapterTest {

  private RatesRepositoryAdapter delegate;
  private CacheManager cacheManager;
  private TenantAwareKeyGenerator keyGenerator;
  private Cache cache;
  private CachedRatesRepositoryAdapter cachedAdapter;

  @BeforeEach
  void setUp() {
    delegate = mock(RatesRepositoryAdapter.class);
    cacheManager = mock(CacheManager.class);
    keyGenerator = mock(TenantAwareKeyGenerator.class);
    cache = mock(Cache.class);
    cachedAdapter = new CachedRatesRepositoryAdapter(delegate, cacheManager, keyGenerator);
  }

  @Test
  @DisplayName("Should delegate findAllByParkingLotId")
  void shouldDelegateFindAllByParkingLotId() {
    final UUID parkingId = UUID.randomUUID();
    final Rates rate = Rates.builder().id(UUID.randomUUID()).build();
    when(delegate.findAllByParkingLotId(parkingId)).thenReturn(List.of(rate));

    final List<Rates> result = cachedAdapter.findAllByParkingLotId(parkingId);

    assertThat(result).containsExactly(rate);
    verify(delegate).findAllByParkingLotId(parkingId);
  }

  @Test
  @DisplayName("Should save rate and evict rates cache")
  void shouldSaveAndEvictRatesCache() {
    final UUID parkingId = UUID.randomUUID();
    final Rates rate = Rates.builder()
      .id(UUID.randomUUID())
      .parking(ParkingLotsReference.builder().id(parkingId).build())
      .build();

    when(delegate.save(rate)).thenReturn(rate);
    when(cacheManager.getCache(CacheNames.RATES.getCacheName())).thenReturn(cache);
    when(keyGenerator.buildKey(parkingId)).thenReturn("tenant:T1:" + parkingId);

    final Rates result = cachedAdapter.save(rate);

    assertThat(result).isEqualTo(rate);
    verify(delegate).save(rate);
    verify(cache).evict("tenant:T1:" + parkingId);
  }

  @Test
  @DisplayName("Should delete by ID and evict rates cache")
  void shouldDeleteAndEvictRatesCache() {
    final UUID rateId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final Rates existing = Rates.builder()
      .id(rateId)
      .parking(ParkingLotsReference.builder().id(parkingId).build())
      .build();

    when(delegate.findById(rateId)).thenReturn(Optional.of(existing));
    when(cacheManager.getCache(CacheNames.RATES.getCacheName())).thenReturn(cache);
    when(keyGenerator.buildKey(parkingId)).thenReturn("tenant:T1:" + parkingId);

    cachedAdapter.deleteById(rateId);

    verify(delegate).deleteById(rateId);
    verify(cache).evict("tenant:T1:" + parkingId);
  }
}
