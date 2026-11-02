package dev.angelcorzo.nivo.infrastructure.adapter.jpa.rates;

import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.domain.model.rates.gateways.RatesRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.TenantAwareKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.rates.mapper.RatesMapper;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;

@Repository
public class RatesRepositoryAdapter extends AdapterOperations<Rates, RateData, UUID, RatesRepositoryData>
  implements
    RatesRepository {

  private final CacheManager cacheManager;
  private final TenantAwareKeyGenerator keyGenerator;

  @org.springframework.beans.factory.annotation.Autowired
  public RatesRepositoryAdapter(RatesRepositoryData repository, RatesMapper mapper,
    ObjectProvider<CacheManager> cacheManagerProvider, ObjectProvider<TenantAwareKeyGenerator> keyGeneratorProvider) {
    super(repository, mapper);
    this.cacheManager = cacheManagerProvider != null ? cacheManagerProvider.getIfAvailable() : null;
    this.keyGenerator = keyGeneratorProvider != null ? keyGeneratorProvider.getIfAvailable() : null;
  }

  public RatesRepositoryAdapter(RatesRepositoryData repository, RatesMapper mapper,
    CacheManager cacheManager, TenantAwareKeyGenerator keyGenerator) {
    super(repository, mapper);
    this.cacheManager = cacheManager;
    this.keyGenerator = keyGenerator;
  }

  @Override
  @Cacheable(value = CacheNames.RATES, keyGenerator = "tenantAwareKeyGenerator")
  public List<Rates> findAllByParkingLotId(UUID parkingLotId) {
    return super.repository.findAllActiveByParkingId(parkingLotId).stream().map(super::toEntity).toList();
  }

  @Override
  public Rates getReferenceById(UUID uuid) {
    return super.toEntity(super.repository.getReferenceById(uuid));
  }

  @Override
  public Boolean existsById(UUID uuid) {
    return super.repository.existsById(uuid);
  }

  @Override
  public Rates save(Rates entity) {
    final Rates saved = super.save(entity);
    if (entity != null && entity.getParking() != null) {
      evictRates(entity.getParking().id());
    }
    return saved;
  }

  @Override
  public void deleteById(UUID uuid) {
    super.repository.findById(uuid).ifPresent(rateData -> {
      if (rateData.getParking() != null) {
        evictRates(rateData.getParking().getId());
      }
    });
    super.repository.deleteById(uuid);
  }

  @Override
  public boolean hasActiveTickets(final UUID rateId) {
    return super.repository.hasActiveTickets(rateId);
  }

  private void evictRates(UUID parkingLotId) {
    if (parkingLotId != null && this.cacheManager != null && this.keyGenerator != null) {
      final Cache cache = this.cacheManager.getCache(CacheNames.RATES);
      if (cache != null) {
        cache.evict(this.keyGenerator.buildKey(parkingLotId));
      }
    }
  }
}
