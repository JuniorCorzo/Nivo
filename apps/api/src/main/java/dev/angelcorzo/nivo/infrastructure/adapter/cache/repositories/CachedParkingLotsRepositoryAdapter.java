package dev.angelcorzo.nivo.infrastructure.adapter.cache.repositories;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.CacheKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.ParkingLotsRepositoryAdapter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

/**
 * Caching decorator for {@link ParkingLotsRepository}.
 *
 * <p>
 * Transparently wraps {@link ParkingLotsRepositoryAdapter} to provide multi-tenant Redis caching and reactive
 * invalidation while preserving pure JPA separation.
 */
@Primary
@Repository("cachedParkingLotsRepositoryAdapter")
@RequiredArgsConstructor
public class CachedParkingLotsRepositoryAdapter implements ParkingLotsRepository {

  private final ParkingLotsRepositoryAdapter delegate;
  private final CacheManager cacheManager;
  private final CacheKeyGenerator keyGenerator;

  @Override
  @Cacheable(value = CacheNames.PARKING_LOTS_KEY, keyGenerator = "cacheKeyGenerator")
  public Optional<ParkingLots> findById(final UUID id) {
    return this.delegate.findById(id);
  }

  @Override
  @Cacheable(value = CacheNames.PARKING_LOTS_LIST_KEY, keyGenerator = "cacheKeyGenerator")
  public List<ParkingLotListItem> findByTenantId(final UUID tenantId) {
    return this.delegate.findByTenantId(tenantId);
  }

  @Override
  public ParkingLots getReferenceById(final UUID id) {
    return this.delegate.getReferenceById(id);
  }

  @Override
  public Boolean existsById(final UUID id) {
    return this.delegate.existsById(id);
  }

  @Override
  public ParkingLots save(final ParkingLots parkingLots) {
    final ParkingLots saved = this.delegate.save(parkingLots);
    if (saved == null) {
      return null;
    }
    evictParkingLot(saved.getId());
    if (saved.getTenant() != null) {
      evictParkingLotList(saved.getTenant().id());
    }
    return saved;
  }

  @Override
  public void delete(final ParkingLots parkingLots) {
    if (parkingLots == null) {
      return;
    }
    evictParkingLot(parkingLots.getId());
    if (parkingLots.getTenant() != null) {
      evictParkingLotList(parkingLots.getTenant().id());
    }
    this.delegate.delete(parkingLots);
  }

  private void evictParkingLot(final UUID id) {
    if (id == null || this.cacheManager == null || this.keyGenerator == null) {
      return;
    }
    final Cache cache = this.cacheManager.getCache(CacheNames.PARKING_LOTS.getCacheName());
    if (cache == null) {
      return;
    }
    cache.evict(this.keyGenerator.buildKey(id));
  }

  private void evictParkingLotList(final UUID tenantId) {
    if (tenantId == null || this.cacheManager == null || this.keyGenerator == null) {
      return;
    }
    final Cache cache = this.cacheManager.getCache(CacheNames.PARKING_LOTS_LIST.getCacheName());
    if (cache == null) {
      return;
    }
    cache.evict(this.keyGenerator.buildKeyForTenant(tenantId));
  }
}
