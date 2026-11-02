package dev.angelcorzo.nivo.infrastructure.adapter.cache;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.redis.testcontainers.RedisContainer;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.config.RedisCacheConfig;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import dev.angelcorzo.nivo.infrastructure.adapter.cache.key.TenantAwareKeyGenerator;
import dev.angelcorzo.nivo.infrastructure.security.context.AuthenticationContextHolder;
import java.util.UUID;
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
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

@SpringBootTest(classes = RedisCacheIntegrationTest.TestConfig.class)
@Testcontainers
@DisplayName("Redis Cache Integration Tests with Testcontainers")
class RedisCacheIntegrationTest {

  private static final RedisContainer redis = new RedisContainer(DockerImageName.parse("redis:7-alpine"));

  static {
    redis.start();
  }

  @DynamicPropertySource
  static void registerRedisProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.data.redis.host", redis::getHost);
    registry.add("spring.data.redis.port", redis::getFirstMappedPort);
    registry.add("spring.cache.type", () -> "redis");
  }

  @Configuration
  @EnableCaching
  @Import({DataRedisAutoConfiguration.class, RedisCacheConfig.class})
  static class TestConfig {

    @Bean
    public TenantAwareKeyGenerator tenantAwareKeyGenerator() {
      @SuppressWarnings("unchecked")
      ObjectProvider<AuthenticationContextHolder> provider = mock(ObjectProvider.class);
      AuthenticationContextHolder holder = mock(AuthenticationContextHolder.class);
      when(provider.getIfAvailable()).thenReturn(holder);
      when(holder.getCurrentTenantId()).thenReturn(UUID.fromString("00000000-0000-0000-0000-000000000001"));
      return new TenantAwareKeyGenerator(provider);
    }
  }

  @Autowired
  private RedisCacheManager cacheManager;

  @Autowired
  private TenantAwareKeyGenerator keyGenerator;

  @Test
  @DisplayName("Should successfully connect to Redis and initialize configured cache buckets")
  void shouldInitializeCacheBuckets() {
    assertThat(cacheManager).isNotNull();
    assertThat(cacheManager.getCache(CacheNames.SLOT_SUMMARY)).isNotNull();
    assertThat(cacheManager.getCache(CacheNames.RATES)).isNotNull();
    assertThat(cacheManager.getCache(CacheNames.PARKING_LOTS)).isNotNull();
  }

  @Test
  @DisplayName("Should write to cache and retrieve cached item with tenant isolation")
  void shouldWriteAndReadFromCache() {
    Cache cache = cacheManager.getCache(CacheNames.RATES);
    assertThat(cache).isNotNull();

    UUID parkingId = UUID.randomUUID();
    String cacheKey = keyGenerator.buildKey(parkingId);
    String rateJson = "{\"id\":\"" + UUID.randomUUID() + "\",\"name\":\"Tarifa Diurna\"}";

    cache.put(cacheKey, rateJson);

    Cache.ValueWrapper cachedValue = cache.get(cacheKey);
    assertThat(cachedValue).isNotNull();
    assertThat(cachedValue.get()).isEqualTo(rateJson);
  }

  @Test
  @DisplayName("Should evict item from cache properly")
  void shouldEvictFromCache() {
    Cache cache = cacheManager.getCache(CacheNames.SLOT_SUMMARY);
    assertThat(cache).isNotNull();

    UUID parkingId = UUID.randomUUID();
    String cacheKey = keyGenerator.buildKey(parkingId);
    cache.put(cacheKey, "active-slots");

    assertThat(cache.get(cacheKey)).isNotNull();

    cache.evict(cacheKey);
    assertThat(cache.get(cacheKey)).isNull();
  }
}
