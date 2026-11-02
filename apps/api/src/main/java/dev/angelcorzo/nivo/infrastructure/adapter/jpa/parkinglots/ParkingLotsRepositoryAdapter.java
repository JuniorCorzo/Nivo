package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.TenantAwareKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.mappers.ParkingLotSummaryDataMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.mappers.ParkingLotsMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;

@Repository
public class ParkingLotsRepositoryAdapter
  extends
    AdapterOperations<ParkingLots, ParkingLotsData, UUID, ParkingLotsRepositoryData>
  implements
    ParkingLotsRepository {

  private final ParkingLotSummaryDataMapper parkingLotSummaryDataMapper;
  private final ParkingLotsMapper parkingLotsMapper;
  private final CacheManager cacheManager;
  private final TenantAwareKeyGenerator keyGenerator;

  @org.springframework.beans.factory.annotation.Autowired
  public ParkingLotsRepositoryAdapter(ParkingLotsRepositoryData repository,
    ParkingLotSummaryDataMapper parkingLotSummaryDataMapper, ParkingLotsMapper mapper,
    ObjectProvider<CacheManager> cacheManagerProvider, ObjectProvider<TenantAwareKeyGenerator> keyGeneratorProvider) {
    super(repository, mapper);
    this.parkingLotSummaryDataMapper = parkingLotSummaryDataMapper;
    this.parkingLotsMapper = mapper;
    this.cacheManager = cacheManagerProvider != null ? cacheManagerProvider.getIfAvailable() : null;
    this.keyGenerator = keyGeneratorProvider != null ? keyGeneratorProvider.getIfAvailable() : null;
  }

  public ParkingLotsRepositoryAdapter(ParkingLotsRepositoryData repository,
    ParkingLotSummaryDataMapper parkingLotSummaryDataMapper, ParkingLotsMapper mapper,
    CacheManager cacheManager, TenantAwareKeyGenerator keyGenerator) {
    super(repository, mapper);
    this.parkingLotSummaryDataMapper = parkingLotSummaryDataMapper;
    this.parkingLotsMapper = mapper;
    this.cacheManager = cacheManager;
    this.keyGenerator = keyGenerator;
  }

  @Override
  public List<ParkingLotListItem> findByTenantId(UUID tenantId) {
    return super.repository.findAllByTenantId(tenantId)
      .stream()
      .map(parkingLotSummaryDataMapper::toSummaryData)
      .map(parkingLotsMapper::toListItem)
      .toList();
  }

  @Override
  public List<ParkingLots> findByOwnerId(UUID ownerId) {
    return super.repository.findAllByOwnerId(ownerId).stream().map(super::toEntity).toList();
  }

  @Override
  public ParkingLots getReferenceById(UUID id) {
    return super.mapper.toEntity(super.repository.getReferenceById(id));
  }

  @Override
  public Boolean existsById(UUID id) {
    return super.repository.existsById(id);
  }

  @Override
  @Cacheable(value = CacheNames.PARKING_LOTS, keyGenerator = "tenantAwareKeyGenerator")
  public Optional<ParkingLots> findById(UUID id) {
    return super.findById(id);
  }

  @Override
  public ParkingLots save(ParkingLots parkingLots) {
    final ParkingLots saved = super.save(parkingLots);
    if (saved != null && saved.getId() != null) {
      evictParkingLots(saved.getId());
    }
    return saved;
  }

  @Override
  public void delete(ParkingLots parkingLots) {
    if (parkingLots != null && parkingLots.getId() != null) {
      evictParkingLots(parkingLots.getId());
    }
    super.repository.delete(super.mapper.toData(parkingLots));
  }

  private void evictParkingLots(UUID id) {
    if (id != null && this.cacheManager != null && this.keyGenerator != null) {
      final Cache cache = this.cacheManager.getCache(CacheNames.PARKING_LOTS);
      if (cache != null) {
        cache.evict(this.keyGenerator.buildKey(id));
      }
    }
  }
}
