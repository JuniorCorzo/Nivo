package dev.angelcorzo.nivo.infrastructure.adapter.cache.repositories;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.specialpolicies.SpecialPolicies;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.CacheKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.specialpolicies.SpecialPoliciesAdapter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

@DisplayName("CachedSpecialPoliciesRepositoryAdapter Unit Tests")
class CachedSpecialPoliciesRepositoryAdapterTest {

  private SpecialPoliciesAdapter delegate;
  private CacheManager cacheManager;
  private CacheKeyGenerator keyGenerator;
  private Cache cache;
  private CachedSpecialPoliciesRepositoryAdapter cachedAdapter;

  @BeforeEach
  void setUp() {
    delegate = mock(SpecialPoliciesAdapter.class);
    cacheManager = mock(CacheManager.class);
    keyGenerator = mock(CacheKeyGenerator.class);
    cache = mock(Cache.class);
    cachedAdapter = new CachedSpecialPoliciesRepositoryAdapter(delegate, cacheManager, keyGenerator);
  }

  @Test
  @DisplayName("Should delegate findAllByTenantId")
  void shouldDelegateFindAllByTenantId() {
    final UUID tenantId = UUID.randomUUID();
    final SpecialPolicies policy = SpecialPolicies.builder().id(UUID.randomUUID()).build();
    when(delegate.findAllByTenantId(tenantId)).thenReturn(List.of(policy));

    final List<SpecialPolicies> result = cachedAdapter.findAllByTenantId(tenantId);

    assertThat(result).containsExactly(policy);
    verify(delegate).findAllByTenantId(tenantId);
  }

  @Test
  @DisplayName("Should delegate findById")
  void shouldDelegateFindById() {
    final UUID id = UUID.randomUUID();
    final SpecialPolicies policy = SpecialPolicies.builder().id(id).build();
    when(delegate.findById(id)).thenReturn(Optional.of(policy));

    final Optional<SpecialPolicies> result = cachedAdapter.findById(id);

    assertThat(result).contains(policy);
    verify(delegate).findById(id);
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
  @DisplayName("Should delegate getReferenceById")
  void shouldDelegateGetReferenceById() {
    final UUID id = UUID.randomUUID();
    final SpecialPolicies policy = SpecialPolicies.builder().id(id).build();
    when(delegate.getReferenceById(id)).thenReturn(policy);

    final SpecialPolicies result = cachedAdapter.getReferenceById(id);

    assertThat(result).isEqualTo(policy);
    verify(delegate).getReferenceById(id);
  }

  @Test
  @DisplayName("Should save special policy and evict cache")
  void shouldSaveAndEvictCache() {
    final UUID tenantId = UUID.randomUUID();
    final SpecialPolicies policy = SpecialPolicies.builder()
      .id(UUID.randomUUID())
      .tenant(TenantReference.builder().id(tenantId).build())
      .build();

    when(delegate.save(policy)).thenReturn(policy);
    when(cacheManager.getCache(CacheNames.SPECIAL_POLICIES.getCacheName())).thenReturn(cache);
    when(keyGenerator.buildKeyForTenant(tenantId)).thenReturn("tenant:" + tenantId);

    final SpecialPolicies result = cachedAdapter.save(policy);

    assertThat(result).isEqualTo(policy);
    verify(delegate).save(policy);
    verify(cache).evict("tenant:" + tenantId);
  }

  @Test
  @DisplayName("Should save policy without tenant and skip eviction")
  void shouldSaveWithoutTenant() {
    final SpecialPolicies policy = SpecialPolicies.builder().id(UUID.randomUUID()).build();
    when(delegate.save(policy)).thenReturn(policy);

    final SpecialPolicies result = cachedAdapter.save(policy);

    assertThat(result).isEqualTo(policy);
    verify(delegate).save(policy);
    verifyNoInteractions(cacheManager);
  }

  @Test
  @DisplayName("Should delete by ID and evict cache")
  void shouldDeleteAndEvictCache() {
    final UUID policyId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final SpecialPolicies existing = SpecialPolicies.builder()
      .id(policyId)
      .tenant(TenantReference.builder().id(tenantId).build())
      .build();

    when(delegate.findById(policyId)).thenReturn(Optional.of(existing));
    when(cacheManager.getCache(CacheNames.SPECIAL_POLICIES.getCacheName())).thenReturn(cache);
    when(keyGenerator.buildKeyForTenant(tenantId)).thenReturn("tenant:" + tenantId);

    cachedAdapter.deleteById(policyId);

    verify(delegate).deleteById(policyId);
    verify(cache).evict("tenant:" + tenantId);
  }

  @Test
  @DisplayName("Should delete by ID without tenant and skip eviction")
  void shouldDeleteWithoutTenant() {
    final UUID policyId = UUID.randomUUID();
    final SpecialPolicies existing = SpecialPolicies.builder().id(policyId).build();

    when(delegate.findById(policyId)).thenReturn(Optional.of(existing));

    cachedAdapter.deleteById(policyId);

    verify(delegate).deleteById(policyId);
    verifyNoInteractions(cacheManager);
  }

  @Test
  @DisplayName("Should delete by ID when existing is empty and skip eviction")
  void shouldDeleteWhenExistingEmpty() {
    final UUID policyId = UUID.randomUUID();
    when(delegate.findById(policyId)).thenReturn(Optional.empty());

    cachedAdapter.deleteById(policyId);

    verify(delegate).deleteById(policyId);
    verifyNoInteractions(cacheManager);
  }

  @Test
  @DisplayName("Should skip eviction when cache is null")
  void shouldSkipEvictionWhenCacheNull() {
    final UUID tenantId = UUID.randomUUID();
    final SpecialPolicies policy = SpecialPolicies.builder()
      .id(UUID.randomUUID())
      .tenant(TenantReference.builder().id(tenantId).build())
      .build();

    when(delegate.save(policy)).thenReturn(policy);
    when(cacheManager.getCache(CacheNames.SPECIAL_POLICIES.getCacheName())).thenReturn(null);

    cachedAdapter.save(policy);

    verify(delegate).save(policy);
  }

  @Test
  @DisplayName("Should skip eviction when cacheManager or keyGenerator is null")
  void shouldSkipWhenCacheManagerOrKeyGenNull() {
    final CachedSpecialPoliciesRepositoryAdapter noCacheAdapter = new CachedSpecialPoliciesRepositoryAdapter(delegate,
      null, null);
    final UUID tenantId = UUID.randomUUID();
    final SpecialPolicies policy = SpecialPolicies.builder()
      .id(UUID.randomUUID())
      .tenant(TenantReference.builder().id(tenantId).build())
      .build();
    when(delegate.save(policy)).thenReturn(policy);

    final SpecialPolicies result = noCacheAdapter.save(policy);

    assertThat(result).isEqualTo(policy);
  }
}
