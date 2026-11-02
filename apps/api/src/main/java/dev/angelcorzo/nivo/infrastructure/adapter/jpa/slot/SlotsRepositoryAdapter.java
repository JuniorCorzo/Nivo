package dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.slots.valueobject.SlotSummary;
import dev.angelcorzo.nivo.domain.model.utils.StringUtils;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.TenantAwareKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.mappers.SlotSummaryDataMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.mappers.SlotsMappers;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;

@Repository
public class SlotsRepositoryAdapter extends AdapterOperations<Slots, SlotsData, UUID, SlotsRepositoryData>
  implements
    SlotsRepository {

  private final SlotSummaryDataMapper slotSummaryDataMapper;
  private final CacheManager cacheManager;
  private final TenantAwareKeyGenerator keyGenerator;

  /**
   * Primary constructor using ObjectProvider for optional cache support in slices.
   */
  @org.springframework.beans.factory.annotation.Autowired
  public SlotsRepositoryAdapter(SlotsRepositoryData repository, SlotsMappers mapper,
    SlotSummaryDataMapper slotSummaryDataMapper, ObjectProvider<CacheManager> cacheManagerProvider,
    ObjectProvider<TenantAwareKeyGenerator> keyGeneratorProvider) {
    super(repository, mapper);
    this.slotSummaryDataMapper = slotSummaryDataMapper;
    this.cacheManager = cacheManagerProvider != null ? cacheManagerProvider.getIfAvailable() : null;
    this.keyGenerator = keyGeneratorProvider != null ? keyGeneratorProvider.getIfAvailable() : null;
  }

  public SlotsRepositoryAdapter(SlotsRepositoryData repository, SlotsMappers mapper,
    SlotSummaryDataMapper slotSummaryDataMapper, CacheManager cacheManager, TenantAwareKeyGenerator keyGenerator) {
    super(repository, mapper);
    this.slotSummaryDataMapper = slotSummaryDataMapper;
    this.cacheManager = cacheManager;
    this.keyGenerator = keyGenerator;
  }

  @Override
  public List<Slots> findAllById(List<UUID> ids) {
    return super.repository.findAllById(ids).stream().map(super::toEntity).toList();
  }

  @Override
  public List<Slots> findAllByIdInAndTenantId(List<UUID> ids, UUID tenantId) {
    return super.repository.findAllByIdInAndTenant_Id(ids, tenantId).stream().map(super::toEntity).toList();
  }

  @Override
  public List<Slots> findAllByParkingLotsId(UUID parkingLotsId) {
    return super.repository.findAllByParking_Id(parkingLotsId).stream().map(super::toEntity).toList();
  }

  @Override
  public List<Slots> findAllByParkingLotsIdAndZoneAndPrefix(UUID parkingLotsId, String zone, String prefix) {
    return super.repository.findAllByParking_IdAndZoneAndPrefix(parkingLotsId, StringUtils.normalize(zone),
      StringUtils.normalize(prefix)).stream().map(super::toEntity).toList();
  }

  @Override
  @Cacheable(value = CacheNames.SLOT_SUMMARY, keyGenerator = "tenantAwareKeyGenerator")
  public List<SlotSummary> findAllSummaryByParkingLotsId(UUID parkingLotsId) {
    return super.repository.findAllSummaryByParking_Id(parkingLotsId)
      .stream()
      .map(this.slotSummaryDataMapper::toSummaryData)
      .map(this.slotSummaryDataMapper::toModel)
      .toList();
  }

  @Override
  public Slots getReferenceById(UUID id) {
    return super.mapper.toEntity(super.repository.getReferenceById(id));
  }

  @Override
  public Boolean existsById(UUID id) {
    return super.repository.existsById(id);
  }

  @Override
  public Slots save(Slots entity) {
    final Slots saved = super.save(entity);
    if (entity != null && entity.getParking() != null) {
      evictSlotSummary(entity.getParking().id());
    }
    return saved;
  }

  @Override
  public List<Slots> saveAll(List<Slots> slots) {
    final List<Slots> saved = super.saveAllEntities(slots);
    if (slots != null && !slots.isEmpty() && slots.getFirst().getParking() != null) {
      evictSlotSummary(slots.getFirst().getParking().id());
    }
    return saved;
  }

  @Override
  public List<Slots> saveAllEntities(List<Slots> slots) {
    final List<Slots> saved = super.saveAllEntities(slots);
    if (slots != null && !slots.isEmpty() && slots.getFirst().getParking() != null) {
      evictSlotSummary(slots.getFirst().getParking().id());
    }
    return saved;
  }

  @Override
  public void deleteById(UUID id) {
    super.repository.findById(id).ifPresent(slotData -> {
      if (slotData.getParking() != null) {
        evictSlotSummary(slotData.getParking().getId());
      }
    });
    super.repository.deleteById(id);
  }

  @Override
  @CacheEvict(value = CacheNames.SLOT_SUMMARY, keyGenerator = "tenantAwareKeyGenerator")
  public int softDeleteByParkingLotsId(UUID parkingLotsId) {
    return super.repository.softDeleteByParkingLotsId(parkingLotsId);
  }

  @Override
  public void batchDelete(List<UUID> ids) {
    if (ids != null && !ids.isEmpty()) {
      super.repository.findById(ids.getFirst()).ifPresent(slotData -> {
        if (slotData.getParking() != null) {
          evictSlotSummary(slotData.getParking().getId());
        }
      });
    }
    super.repository.deleteAllByIdInBatch(ids);
  }

  private void evictSlotSummary(UUID parkingLotId) {
    if (parkingLotId != null && this.cacheManager != null && this.keyGenerator != null) {
      final Cache cache = this.cacheManager.getCache(CacheNames.SLOT_SUMMARY);
      if (cache != null) {
        cache.evict(this.keyGenerator.buildKey(parkingLotId));
      }
    }
  }
}
