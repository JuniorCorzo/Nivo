package dev.angelcorzo.nivo.infrastructure.adapter.cache.repositories;

import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.domain.model.rates.gateways.RatesRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.CacheKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.rates.RatesRepositoryAdapter;
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
 * Caching decorator for {@link RatesRepository}.
 */
@Primary
@Repository("cachedRatesRepositoryAdapter")
@RequiredArgsConstructor
public class CachedRatesRepositoryAdapter implements RatesRepository {

  private final RatesRepositoryAdapter delegate;
  private final CacheManager cacheManager;
  private final CacheKeyGenerator keyGenerator;

  @Override
  @Cacheable(value = CacheNames.RATES_KEY, keyGenerator = "cacheKeyGenerator")
  public List<Rates> findAllByParkingLotId(final UUID parkingLotId) {
    return this.delegate.findAllByParkingLotId(parkingLotId);
  }

  @Override
  public List<Rates> findAll() {
    return this.delegate.findAll();
  }

  @Override
  public Optional<Rates> findById(final UUID id) {
    return this.delegate.findById(id);
  }

  @Override
  public Rates save(final Rates entity) {
    final Rates saved = this.delegate.save(entity);
    if (entity != null && entity.getParking() != null) {
      evictRates(entity.getParking().id());
    }
    return saved;
  }

  @Override
  public void deleteById(final UUID uuid) {
    final Optional<Rates> existing = this.delegate.findById(uuid);
    this.delegate.deleteById(uuid);
    if (existing.isPresent() && existing.get().getParking() != null) {
      evictRates(existing.get().getParking().id());
    }
  }

  @Override
  public Rates getReferenceById(final UUID uuid) {
    return this.delegate.getReferenceById(uuid);
  }

  @Override
  public Boolean existsById(final UUID uuid) {
    return this.delegate.existsById(uuid);
  }

  @Override
  public boolean hasActiveTickets(final UUID rateId) {
    return this.delegate.hasActiveTickets(rateId);
  }

  private void evictRates(final UUID parkingLotId) {
    if (parkingLotId == null || this.cacheManager == null || this.keyGenerator == null) {
      return;
    }
    final Cache cache = this.cacheManager.getCache(CacheNames.RATES.getCacheName());
    if (cache == null) {
      return;
    }
    cache.evict(this.keyGenerator.buildKey(parkingLotId));
  }
}
