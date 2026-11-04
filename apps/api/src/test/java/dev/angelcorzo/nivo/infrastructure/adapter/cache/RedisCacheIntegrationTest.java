package dev.angelcorzo.nivo.infrastructure.adapter.cache;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.redis.testcontainers.RedisContainer;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.config.RedisCacheConfig;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.config.RedisCacheProperties;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.TenantAwareKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.security.context.AuthenticationContextHolder;
import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.awaitility.Awaitility;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.redis.autoconfigure.DataRedisAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

@SpringBootTest(classes = RedisCacheIntegrationTest.TestConfig.class)
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@DisplayName("Redis Cache Integration Tests with Testcontainers (Multi-Tenant Isolation)")
class RedisCacheIntegrationTest {

  private static final RedisContainer redis = new RedisContainer(DockerImageName.parse("redis:7-alpine"));

  static {
    redis.start();
  }

  @DynamicPropertySource
  static void registerRedisProperties(final DynamicPropertyRegistry registry) {
    registry.add("spring.data.redis.host", redis::getHost);
    registry.add("spring.data.redis.port", redis::getFirstMappedPort);
    registry.add("spring.cache.type", () -> "redis");
  }

  @Configuration
  @EnableCaching
  @Import({DataRedisAutoConfiguration.class, RedisCacheConfig.class, RedisCacheProperties.class})
  static class TestConfig {

    static final AtomicReference<UUID> ACTIVE_TENANT = new AtomicReference<>(
      UUID.fromString("00000000-0000-0000-0000-000000000001"));

    @Bean
    public TenantAwareKeyGenerator tenantAwareKeyGenerator() {
      @SuppressWarnings("unchecked")
      final ObjectProvider<AuthenticationContextHolder> provider = mock(ObjectProvider.class);
      final AuthenticationContextHolder holder = mock(AuthenticationContextHolder.class);
      when(provider.getIfAvailable()).thenReturn(holder);
      when(holder.getCurrentTenantId()).thenAnswer(invocation -> ACTIVE_TENANT.get());
      return new TenantAwareKeyGenerator(provider);
    }
  }

  @Autowired
  private RedisCacheManager cacheManager;

  @Autowired
  private TenantAwareKeyGenerator keyGenerator;

  private static final UUID TENANT_ONE = UUID.fromString("00000000-0000-0000-0000-000000000001");
  private static final UUID TENANT_TWO = UUID.fromString("00000000-0000-0000-0000-000000000002");

  @BeforeEach
  void resetTenantContext() {
    TestConfig.ACTIVE_TENANT.set(TENANT_ONE);
  }

  @Test
  @DisplayName("Should successfully connect to Redis and initialize configured cache buckets")
  void shouldInitializeCacheBuckets() {
    assertThat(cacheManager).isNotNull();
    for (final CacheNames cacheName : CacheNames.values()) {
      assertThat(cacheManager.getCache(cacheName.getCacheName())).isNotNull();
    }
  }

  @Test
  @DisplayName("Should enforce strict multi-tenant cache isolation between two tenants")
  void shouldEnforceMultiTenantCacheIsolation() {
    final Cache cache = cacheManager.getCache(CacheNames.RATES.getCacheName());
    assertThat(cache).isNotNull();

    final UUID sharedParkingId = UUID.randomUUID();

    // 1. Act as Tenant 1: write cached value
    TestConfig.ACTIVE_TENANT.set(TENANT_ONE);
    final String keyTenantOne = keyGenerator.buildKey(sharedParkingId);
    final String dataTenantOne = "Rate Data Tenant 1";
    cache.put(keyTenantOne, dataTenantOne);

    Awaitility.await().atMost(Duration.ofSeconds(3)).untilAsserted(() -> {
      final Cache.ValueWrapper val = cache.get(keyTenantOne);
      assertThat(val).isNotNull();
      assertThat(val.get()).isEqualTo(dataTenantOne);
    });

    // 2. Switch to Tenant 2: verify Tenant 2 cannot access Tenant 1's cache
    TestConfig.ACTIVE_TENANT.set(TENANT_TWO);
    final String keyTenantTwo = keyGenerator.buildKey(sharedParkingId);

    assertThat(keyTenantTwo).isNotEqualTo(keyTenantOne);
    assertThat(cache.get(keyTenantTwo)).isNull();

    // 3. Tenant 2 writes its own data for the same parking ID
    final String dataTenantTwo = "Rate Data Tenant 2";
    cache.put(keyTenantTwo, dataTenantTwo);

    Awaitility.await().atMost(Duration.ofSeconds(3)).untilAsserted(() -> {
      final Cache.ValueWrapper val = cache.get(keyTenantTwo);
      assertThat(val).isNotNull();
      assertThat(val.get()).isEqualTo(dataTenantTwo);
    });

    // 4. Switch back to Tenant 1: verify data is intact
    TestConfig.ACTIVE_TENANT.set(TENANT_ONE);
    Awaitility.await().atMost(Duration.ofSeconds(3)).untilAsserted(() -> {
      final Cache.ValueWrapper val = cache.get(keyTenantOne);
      assertThat(val).isNotNull();
      assertThat(val.get()).isEqualTo(dataTenantOne);
    });

    // 5. Eviction isolation: Tenant 1 evicts its cache; Tenant 2's cache remains untouched
    cache.evict(keyTenantOne);
    Awaitility.await()
      .atMost(Duration.ofSeconds(3))
      .untilAsserted(() -> {
        assertThat(cache.get(keyTenantOne)).isNull();
      });

    TestConfig.ACTIVE_TENANT.set(TENANT_TWO);
    Awaitility.await().atMost(Duration.ofSeconds(3)).untilAsserted(() -> {
      final Cache.ValueWrapper val = cache.get(keyTenantTwo);
      assertThat(val).isNotNull();
      assertThat(val.get()).isEqualTo(dataTenantTwo);
    });
  }

  @Test
  @DisplayName("Should prevent cache poisoning by throwing IllegalStateException when tenant context is null")
  void shouldPreventCachePoisoningWhenTenantNull() {
    TestConfig.ACTIVE_TENANT.set(null);
    final UUID parkingId = UUID.randomUUID();

    assertThatThrownBy(() -> keyGenerator.buildKey(parkingId))
      .isInstanceOf(IllegalStateException.class)
      .hasMessageContaining("Active security context does not contain an authenticated tenant ID");
  }

  @Test
  @DisplayName("Should isolate public availability cache using public prefix")
  void shouldIsolatePublicCache() {
    final Cache cache = cacheManager.getCache(CacheNames.PUBLIC_AVAILABILITY.getCacheName());
    assertThat(cache).isNotNull();

    final UUID parkingId = UUID.randomUUID();
    final String publicKey = TenantAwareKeyGenerator.buildPublicKey("availability", parkingId);

    assertThat(publicKey).startsWith("public:availability:");
    assertThat(publicKey).doesNotContain("tenant:");

    cache.put(publicKey, "Public sanitized availability");
    Awaitility.await().atMost(Duration.ofSeconds(3)).untilAsserted(() -> {
      final Cache.ValueWrapper val = cache.get(publicKey);
      assertThat(val).isNotNull();
      assertThat(val.get()).isEqualTo("Public sanitized availability");
    });
  }
}
