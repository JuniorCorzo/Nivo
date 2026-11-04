package dev.angelcorzo.nivo.infrastructure.adapter.cache.repositories;

import dev.angelcorzo.nivo.domain.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.domain.model.specialpolicies.gateways.SpecialPoliciesRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.TenantAwareKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.specialpolicies.SpecialPoliciesAdapter;
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
 * Caching decorator for {@link SpecialPoliciesRepository}.
 */
@Primary
@Repository("cachedSpecialPoliciesRepositoryAdapter")
@RequiredArgsConstructor
public class CachedSpecialPoliciesRepositoryAdapter implements SpecialPoliciesRepository {

  private final SpecialPoliciesAdapter delegate;
  private final CacheManager cacheManager;
  private final TenantAwareKeyGenerator keyGenerator;

  @Override
  @Cacheable(value = CacheNames.SPECIAL_POLICIES_KEY, keyGenerator = "tenantAwareKeyGenerator")
  public List<SpecialPolicies> findAllByTenantId(final UUID tenantId) {
    return this.delegate.findAllByTenantId(tenantId);
  }

  @Override
  public Optional<SpecialPolicies> findById(final UUID id) {
    return this.delegate.findById(id);
  }

  @Override
  public Boolean existsById(final UUID id) {
    return this.delegate.existsById(id);
  }

  @Override
  public SpecialPolicies getReferenceById(final UUID id) {
    return this.delegate.getReferenceById(id);
  }

  @Override
  public SpecialPolicies save(final SpecialPolicies entity) {
    final SpecialPolicies saved = this.delegate.save(entity);
    if (saved != null && saved.getTenant() != null && saved.getTenant().id() != null) {
      evictSpecialPolicies(saved.getTenant().id());
    }
    return saved;
  }

  @Override
  public void deleteById(final UUID uuid) {
    final Optional<SpecialPolicies> existing = this.delegate.findById(uuid);
    this.delegate.deleteById(uuid);
    if (existing.isPresent() && existing.get().getTenant() != null) {
      evictSpecialPolicies(existing.get().getTenant().id());
    }
  }

  private void evictSpecialPolicies(final UUID tenantId) {
    if (tenantId == null || this.cacheManager == null || this.keyGenerator == null) {
      return;
    }
    final Cache cache = this.cacheManager.getCache(CacheNames.SPECIAL_POLICIES.getCacheName());
    if (cache == null) {
      return;
    }
    cache.evict(this.keyGenerator.buildKeyForTenant(tenantId));
  }
}
