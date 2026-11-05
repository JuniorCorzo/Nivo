package dev.angelcorzo.nivo.infrastructure.adapter.cache.repositories;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkinglots.valueobject.ParkingLotsReference;
import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.CacheKeyGenerator;
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
  private CacheKeyGenerator keyGenerator;
  private Cache cache;
  private CachedRatesRepositoryAdapter cachedAdapter;

  @BeforeEach
  void setUp() {
    delegate = mock(RatesRepositoryAdapter.class);
    cacheManager = mock(CacheManager.class);
    keyGenerator = mock(CacheKeyGenerator.class);
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
  @DisplayName("Should delegate findAll")
  void shouldDelegateFindAll() {
    final Rates rate = Rates.builder().id(UUID.randomUUID()).build();
    when(delegate.findAll()).thenReturn(List.of(rate));

    final List<Rates> result = cachedAdapter.findAll();

    assertThat(result).containsExactly(rate);
    verify(delegate).findAll();
  }

  @Test
  @DisplayName("Should delegate findById")
  void shouldDelegateFindById() {
    final UUID id = UUID.randomUUID();
    final Rates rate = Rates.builder().id(id).build();
    when(delegate.findById(id)).thenReturn(Optional.of(rate));

    final Optional<Rates> result = cachedAdapter.findById(id);

    assertThat(result).contains(rate);
    verify(delegate).findById(id);
  }

  @Test
  @DisplayName("Should delegate getReferenceById")
  void shouldDelegateGetReferenceById() {
    final UUID id = UUID.randomUUID();
    final Rates rate = Rates.builder().id(id).build();
    when(delegate.getReferenceById(id)).thenReturn(rate);

    final Rates result = cachedAdapter.getReferenceById(id);

    assertThat(result).isEqualTo(rate);
    verify(delegate).getReferenceById(id);
  }

  @Test
  @DisplayName("Should delegate existsById")
  void shouldDelegateExistsById() {
    final UUID id = UUID.randomUUID();
    when(delegate.existsById(id)).thenReturn(true);

    final Boolean result = cachedAdapter.existsById(id);

    assertThat(result).isTrue();
    verify(delegate).existsById(id);
  }

  @Test
  @DisplayName("Should delegate hasActiveTickets")
  void shouldDelegateHasActiveTickets() {
    final UUID rateId = UUID.randomUUID();
    when(delegate.hasActiveTickets(rateId)).thenReturn(true);

    final boolean result = cachedAdapter.hasActiveTickets(rateId);

    assertThat(result).isTrue();
    verify(delegate).hasActiveTickets(rateId);
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
  @DisplayName("Should save rate without parking and skip eviction")
  void shouldSaveWithoutParking() {
    final Rates rate = Rates.builder().id(UUID.randomUUID()).build();
    when(delegate.save(rate)).thenReturn(rate);

    final Rates result = cachedAdapter.save(rate);

    assertThat(result).isEqualTo(rate);
    verify(delegate).save(rate);
    verifyNoInteractions(cacheManager);
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

  @Test
  @DisplayName("Should delete by ID without parking and skip eviction")
  void shouldDeleteWithoutParking() {
    final UUID rateId = UUID.randomUUID();
    final Rates existing = Rates.builder().id(rateId).build();

    when(delegate.findById(rateId)).thenReturn(Optional.of(existing));

    cachedAdapter.deleteById(rateId);

    verify(delegate).deleteById(rateId);
    verifyNoInteractions(cacheManager);
  }

  @Test
  @DisplayName("Should delete by ID when existing is empty and skip eviction")
  void shouldDeleteWhenExistingEmpty() {
    final UUID rateId = UUID.randomUUID();
    when(delegate.findById(rateId)).thenReturn(Optional.empty());

    cachedAdapter.deleteById(rateId);

    verify(delegate).deleteById(rateId);
    verifyNoInteractions(cacheManager);
  }

  @Test
  @DisplayName("Should skip eviction when cache is null")
  void shouldSkipEvictionWhenCacheNull() {
    final UUID parkingId = UUID.randomUUID();
    final Rates rate = Rates.builder()
      .id(UUID.randomUUID())
      .parking(ParkingLotsReference.builder().id(parkingId).build())
      .build();

    when(delegate.save(rate)).thenReturn(rate);
    when(cacheManager.getCache(CacheNames.RATES.getCacheName())).thenReturn(null);

    cachedAdapter.save(rate);

    verify(delegate).save(rate);
  }

  @Test
  @DisplayName("Should skip eviction when cacheManager or keyGenerator is null")
  void shouldSkipWhenCacheManagerOrKeyGenNull() {
    final CachedRatesRepositoryAdapter noCacheAdapter = new CachedRatesRepositoryAdapter(delegate, null, null);
    final UUID parkingId = UUID.randomUUID();
    final Rates rate = Rates.builder()
      .id(UUID.randomUUID())
      .parking(ParkingLotsReference.builder().id(parkingId).build())
      .build();
    when(delegate.save(rate)).thenReturn(rate);

    final Rates result = noCacheAdapter.save(rate);

    assertThat(result).isEqualTo(rate);
  }
}
