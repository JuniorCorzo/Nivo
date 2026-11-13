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
  @DisplayName("Should delegate findById")
  void shouldDelegateFindById() {
    final UUID id = UUID.randomUUID();
    final Slots slot = Slots.builder().id(id).build();
    when(delegate.findById(id)).thenReturn(Optional.of(slot));

    final Optional<Slots> result = cachedAdapter.findById(id);

    assertThat(result).contains(slot);
    verify(delegate).findById(id);
  }

  @Test
  @DisplayName("Should delegate findAllById")
  void shouldDelegateFindAllById() {
    final List<UUID> ids = List.of(UUID.randomUUID());
    final Slots slot = Slots.builder().id(ids.getFirst()).build();
    when(delegate.findAllById(ids)).thenReturn(List.of(slot));

    final List<Slots> result = cachedAdapter.findAllById(ids);

    assertThat(result).containsExactly(slot);
    verify(delegate).findAllById(ids);
  }

  @Test
  @DisplayName("Should delegate findAllByIdInAndTenantId")
  void shouldDelegateFindAllByIdInAndTenantId() {
    final List<UUID> ids = List.of(UUID.randomUUID());
    final UUID tenantId = UUID.randomUUID();
    final Slots slot = Slots.builder().id(ids.getFirst()).build();
    when(delegate.findAllByIdInAndTenantId(ids, tenantId)).thenReturn(List.of(slot));

    final List<Slots> result = cachedAdapter.findAllByIdInAndTenantId(ids, tenantId);

    assertThat(result).containsExactly(slot);
    verify(delegate).findAllByIdInAndTenantId(ids, tenantId);
  }

  @Test
  @DisplayName("Should delegate findAllByParkingLotsId")
  void shouldDelegateFindAllByParkingLotsId() {
    final UUID parkingLotId = UUID.randomUUID();
    final Slots slot = Slots.builder().id(UUID.randomUUID()).build();
    when(delegate.findAllByParkingLotsId(parkingLotId)).thenReturn(List.of(slot));

    final List<Slots> result = cachedAdapter.findAllByParkingLotsId(parkingLotId);

    assertThat(result).containsExactly(slot);
    verify(delegate).findAllByParkingLotsId(parkingLotId);
  }

  @Test
  @DisplayName("Should delegate findAllByParkingLotsIdAndZoneAndPrefix")
  void shouldDelegateFindAllByZoneAndPrefix() {
    final UUID parkingLotId = UUID.randomUUID();
    final Slots slot = Slots.builder().id(UUID.randomUUID()).build();
    when(delegate.findAllByParkingLotsIdAndZoneAndPrefix(parkingLotId, "A", "P")).thenReturn(List.of(slot));

    final List<Slots> result = cachedAdapter.findAllByParkingLotsIdAndZoneAndPrefix(parkingLotId, "A", "P");

    assertThat(result).containsExactly(slot);
    verify(delegate).findAllByParkingLotsIdAndZoneAndPrefix(parkingLotId, "A", "P");
  }

  @Test
  @DisplayName("Should delegate getReferenceById")
  void shouldDelegateGetReferenceById() {
    final UUID id = UUID.randomUUID();
    final Slots slot = Slots.builder().id(id).build();
    when(delegate.getReferenceById(id)).thenReturn(slot);

    final Slots result = cachedAdapter.getReferenceById(id);

    assertThat(result).isEqualTo(slot);
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
  @DisplayName("Should save slot without parking and skip eviction")
  void shouldSaveWithoutParking() {
    final Slots slot = Slots.builder().id(UUID.randomUUID()).build();
    when(delegate.save(slot)).thenReturn(slot);

    final Slots result = cachedAdapter.save(slot);

    assertThat(result).isEqualTo(slot);
    verify(delegate).save(slot);
    verifyNoInteractions(cacheManager);
  }

  @Test
  @DisplayName("Should saveAll and evict slot summary cache")
  void shouldSaveAllAndEvictSlotSummary() {
    final UUID parkingId = UUID.randomUUID();
    final Slots slot = Slots.builder()
      .id(UUID.randomUUID())
      .parking(ParkingLotsReference.builder().id(parkingId).build())
      .build();

    when(delegate.saveAll(List.of(slot))).thenReturn(List.of(slot));
    when(cacheManager.getCache(CacheNames.SLOT_SUMMARY.getCacheName())).thenReturn(cache);
    when(keyGenerator.buildKey(parkingId)).thenReturn("tenant:T1:" + parkingId);

    final List<Slots> result = cachedAdapter.saveAll(List.of(slot));

    assertThat(result).containsExactly(slot);
    verify(cache).evict("tenant:T1:" + parkingId);
  }

  @Test
  @DisplayName("Should saveAllEntities and evict slot summary cache")
  void shouldSaveAllEntitiesAndEvict() {
    final UUID parkingId = UUID.randomUUID();
    final Slots slot = Slots.builder()
      .id(UUID.randomUUID())
      .parking(ParkingLotsReference.builder().id(parkingId).build())
      .build();

    when(delegate.saveAllEntities(List.of(slot))).thenReturn(List.of(slot));
    when(cacheManager.getCache(CacheNames.SLOT_SUMMARY.getCacheName())).thenReturn(cache);
    when(keyGenerator.buildKey(parkingId)).thenReturn("tenant:T1:" + parkingId);

    final List<Slots> result = cachedAdapter.saveAllEntities(List.of(slot));

    assertThat(result).containsExactly(slot);
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
  @DisplayName("Should delete by ID without parking and skip eviction")
  void shouldDeleteWithoutParking() {
    final UUID slotId = UUID.randomUUID();
    final Slots existing = Slots.builder().id(slotId).build();

    when(delegate.findById(slotId)).thenReturn(Optional.of(existing));

    cachedAdapter.deleteById(slotId);

    verify(delegate).deleteById(slotId);
    verifyNoInteractions(cacheManager);
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

  @Test
  @DisplayName("Should batch delete and evict slot summary")
  void shouldBatchDeleteAndEvict() {
    final UUID slotId = UUID.randomUUID();
    final UUID parkingId = UUID.randomUUID();
    final Slots existing = Slots.builder()
      .id(slotId)
      .parking(ParkingLotsReference.builder().id(parkingId).build())
      .build();

    when(delegate.findAllById(List.of(slotId))).thenReturn(List.of(existing));
    when(cacheManager.getCache(CacheNames.SLOT_SUMMARY.getCacheName())).thenReturn(cache);
    when(keyGenerator.buildKey(parkingId)).thenReturn("tenant:T1:" + parkingId);

    cachedAdapter.batchDelete(List.of(slotId));

    verify(delegate).batchDelete(List.of(slotId));
    verify(cache).evict("tenant:T1:" + parkingId);
  }

  @Test
  @DisplayName("Should batch delete empty list safely")
  void shouldBatchDeleteEmpty() {
    cachedAdapter.batchDelete(List.of());

    verify(delegate).batchDelete(List.of());
    verifyNoInteractions(cacheManager);
  }

  @Test
  @DisplayName("Should delegate batchDelete with tenantId and evict cache")
  void shouldDelegateBatchDeleteWithTenantId() {
    final UUID parkingLotId = UUID.randomUUID();
    final UUID slotId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final Slots slot = Slots.builder()
      .id(slotId)
      .parking(ParkingLotsReference.builder().id(parkingLotId).build())
      .build();

    when(delegate.findAllById(List.of(slotId))).thenReturn(List.of(slot));
    when(cacheManager.getCache(CacheNames.SLOT_SUMMARY.getCacheName())).thenReturn(cache);
    when(keyGenerator.buildKey(parkingLotId)).thenReturn("slot-summary:" + parkingLotId);

    cachedAdapter.batchDelete(List.of(slotId), tenantId);

    verify(delegate).batchDelete(List.of(slotId), tenantId);
    verify(cache).evict("slot-summary:" + parkingLotId);
  }

  @Test
  @DisplayName("Should batch delete across multiple parking lots and evict all summaries")
  void shouldBatchDeleteAcrossMultipleParkingLotsAndEvictAll() {
    final UUID parkingLotId1 = UUID.randomUUID();
    final UUID parkingLotId2 = UUID.randomUUID();
    final UUID slotId1 = UUID.randomUUID();
    final UUID slotId2 = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();

    final Slots slot1 = Slots.builder()
      .id(slotId1)
      .parking(ParkingLotsReference.builder().id(parkingLotId1).build())
      .build();
    final Slots slot2 = Slots.builder()
      .id(slotId2)
      .parking(ParkingLotsReference.builder().id(parkingLotId2).build())
      .build();

    final List<UUID> ids = List.of(slotId1, slotId2);
    when(delegate.findAllById(ids)).thenReturn(List.of(slot1, slot2));
    when(cacheManager.getCache(CacheNames.SLOT_SUMMARY.getCacheName())).thenReturn(cache);
    when(keyGenerator.buildKey(parkingLotId1)).thenReturn("slot-summary:" + parkingLotId1);
    when(keyGenerator.buildKey(parkingLotId2)).thenReturn("slot-summary:" + parkingLotId2);

    cachedAdapter.batchDelete(ids, tenantId);

    verify(delegate).batchDelete(ids, tenantId);
    verify(cache).evict("slot-summary:" + parkingLotId1);
    verify(cache).evict("slot-summary:" + parkingLotId2);
  }

  @Test
  @DisplayName("Should delegate batchDelete with tenantId on empty list")
  void shouldDelegateBatchDeleteWithTenantIdEmptyList() {
    final UUID tenantId = UUID.randomUUID();
    cachedAdapter.batchDelete(List.of(), tenantId);

    verify(delegate).batchDelete(List.of(), tenantId);
    verifyNoMoreInteractions(cacheManager);
  }
}
