package dev.angelcorzo.nivo.infrastructure.adapter.cache.repositories;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.slots.valueobject.SlotSummary;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.CacheKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.SlotsRepositoryAdapter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

/**
 * Caching decorator for {@link SlotsRepository}.
 */
@Primary
@Repository("cachedSlotsRepositoryAdapter")
@RequiredArgsConstructor
public class CachedSlotsRepositoryAdapter implements SlotsRepository {

  private final SlotsRepositoryAdapter delegate;
  private final CacheManager cacheManager;
  private final CacheKeyGenerator keyGenerator;

  @Override
  @Cacheable(value = CacheNames.SLOT_SUMMARY_KEY, keyGenerator = "cacheKeyGenerator")
  public List<SlotSummary> findAllSummaryByParkingLotsId(final UUID parkingLotsId) {
    return this.delegate.findAllSummaryByParkingLotsId(parkingLotsId);
  }

  @Override
  public Optional<Slots> findById(final UUID id) {
    return this.delegate.findById(id);
  }

  @Override
  public Slots save(final Slots entity) {
    final Slots saved = this.delegate.save(entity);
    if (entity != null && entity.getParking() != null) {
      evictSlotSummary(entity.getParking().id());
    }
    return saved;
  }

  @Override
  public List<Slots> saveAll(final List<Slots> slots) {
    final List<Slots> saved = this.delegate.saveAll(slots);
    evictFirstSlot(slots);
    return saved;
  }

  @Override
  public List<Slots> saveAllEntities(final List<Slots> slots) {
    final List<Slots> saved = this.delegate.saveAllEntities(slots);
    evictFirstSlot(slots);
    return saved;
  }

  @Override
  public void deleteById(final UUID id) {
    final Optional<Slots> existing = this.delegate.findById(id);
    this.delegate.deleteById(id);
    if (existing.isPresent() && existing.get().getParking() != null) {
      evictSlotSummary(existing.get().getParking().id());
    }
  }

  @Override
  @CacheEvict(value = CacheNames.SLOT_SUMMARY_KEY, keyGenerator = "cacheKeyGenerator")
  public int softDeleteByParkingLotsId(final UUID parkingLotsId) {
    return this.delegate.softDeleteByParkingLotsId(parkingLotsId);
  }

  @Override
  public void batchDelete(final List<UUID> ids) {
    if (ids != null && !ids.isEmpty()) {
      final Optional<Slots> existing = this.delegate.findById(ids.getFirst());
      if (existing.isPresent() && existing.get().getParking() != null) {
        evictSlotSummary(existing.get().getParking().id());
      }
    }
    this.delegate.batchDelete(ids);
  }

  @Override
  public List<Slots> findAllById(final List<UUID> ids) {
    return this.delegate.findAllById(ids);
  }

  @Override
  public List<Slots> findAllByIdInAndTenantId(final List<UUID> ids, final UUID tenantId) {
    return this.delegate.findAllByIdInAndTenantId(ids, tenantId);
  }

  @Override
  public List<Slots> findAllByParkingLotsId(final UUID parkingLotsId) {
    return this.delegate.findAllByParkingLotsId(parkingLotsId);
  }

  @Override
  public List<Slots> findAllByParkingLotsIdAndZoneAndPrefix(final UUID parkingLotsId, final String zone,
    final String prefix) {
    return this.delegate.findAllByParkingLotsIdAndZoneAndPrefix(parkingLotsId, zone, prefix);
  }

  @Override
  public Slots getReferenceById(final UUID id) {
    return this.delegate.getReferenceById(id);
  }

  @Override
  public Boolean existsById(final UUID id) {
    return this.delegate.existsById(id);
  }

  private void evictFirstSlot(final List<Slots> slots) {
    if (slots == null || slots.isEmpty() || slots.getFirst().getParking() == null) {
      return;
    }
    evictSlotSummary(slots.getFirst().getParking().id());
  }

  private void evictSlotSummary(final UUID parkingLotId) {
    if (parkingLotId == null || this.cacheManager == null || this.keyGenerator == null) {
      return;
    }
    final Cache cache = this.cacheManager.getCache(CacheNames.SLOT_SUMMARY.getCacheName());
    if (cache == null) {
      return;
    }
    cache.evict(this.keyGenerator.buildKey(parkingLotId));
  }
}
