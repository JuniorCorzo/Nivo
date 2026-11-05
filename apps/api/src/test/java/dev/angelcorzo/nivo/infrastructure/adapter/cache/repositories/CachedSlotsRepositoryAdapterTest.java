package dev.angelcorzo.nivo.infrastructure.adapter.cache.repositories;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkinglots.valueobject.ParkingLotsReference;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.valueobject.SlotSummary;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.CacheKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.SlotsRepositoryAdapter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

@DisplayName("CachedSlotsRepositoryAdapter Unit Tests")
class CachedSlotsRepositoryAdapterTest {

  private SlotsRepositoryAdapter delegate;
  private CacheManager cacheManager;
  private CacheKeyGenerator keyGenerator;
  private Cache cache;
  private CachedSlotsRepositoryAdapter cachedAdapter;

  @BeforeEach
  void setUp() {
    delegate = mock(SlotsRepositoryAdapter.class);
    cacheManager = mock(CacheManager.class);
    keyGenerator = mock(CacheKeyGenerator.class);
    cache = mock(Cache.class);
    cachedAdapter = new CachedSlotsRepositoryAdapter(delegate, cacheManager, keyGenerator);
  }

  @Test
  @DisplayName("Should delegate findAllSummaryByParkingLotsId")
  void shouldDelegateFindAllSummary() {
    final UUID parkingLotId = UUID.randomUUID();
    final SlotSummary summary = mock(SlotSummary.class);
    when(delegate.findAllSummaryByParkingLotsId(parkingLotId)).thenReturn(List.of(summary));

    final List<SlotSummary> result = cachedAdapter.findAllSummaryByParkingLotsId(parkingLotId);

    assertThat(result).containsExactly(summary);
    verify(delegate).findAllSummaryByParkingLotsId(parkingLotId);
  }

  @Test
  @DisplayName("Should save slot and evict slot summary cache")
  void shouldSaveAndEvictSlotSummary() {
    final UUID parkingId = UUID.randomUUID();
    final Slots slot = Slots.builder()
      .id(UUID.randomUUID())
      .parking(ParkingLotsReference.builder().id(parkingId).build())
      .build();

    when(delegate.save(slot)).thenReturn(slot);
    when(cacheManager.getCache(CacheNames.SLOT_SUMMARY.getCacheName())).thenReturn(cache);
    when(keyGenerator.buildKey(parkingId)).thenReturn("tenant:T1:" + parkingId);

    final Slots result = cachedAdapter.save(slot);

    assertThat(result).isEqualTo(slot);
    verify(delegate).save(slot);
    verify(cache).evict("tenant:T1:" + parkingId);
  }

  @Test
  @DisplayName("Should delete by ID and evict slot summary cache")
  void shouldDeleteAndEvictSlotSummary() {
    final UUID slotId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final Slots existing = Slots.builder()
      .id(slotId)
      .parking(ParkingLotsReference.builder().id(parkingId).build())
      .build();

    when(delegate.findById(slotId)).thenReturn(Optional.of(existing));
    when(cacheManager.getCache(CacheNames.SLOT_SUMMARY.getCacheName())).thenReturn(cache);
    when(keyGenerator.buildKey(parkingId)).thenReturn("tenant:T1:" + parkingId);

    cachedAdapter.deleteById(slotId);

    verify(delegate).deleteById(slotId);
    verify(cache).evict("tenant:T1:" + parkingId);
  }

  @Test
  @DisplayName("Should soft delete by parking lot ID")
  void shouldSoftDelete() {
    final UUID parkingLotId = UUID.randomUUID();
    when(delegate.softDeleteByParkingLotsId(parkingLotId)).thenReturn(3);

    final int result = cachedAdapter.softDeleteByParkingLotsId(parkingLotId);

    assertThat(result).isEqualTo(3);
    verify(delegate).softDeleteByParkingLotsId(parkingLotId);
  }
}
