package dev.angelcorzo.nivo.infrastructure.adapter.cache.config;

import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Spring Cache and Redis configuration.
 *
 * <p>
 * Sets up RedisCacheManager with entity-specific TTLs driven by environment properties, JSON serialization, and
 * transparent fallback error handling.
 */
@Configuration
@EnableCaching
@RequiredArgsConstructor
public class RedisCacheConfig implements CachingConfigurer {

  private final RedisCacheProperties cacheProperties;

  @Bean
  public RedisCacheManager cacheManager(final RedisConnectionFactory connectionFactory) {
    final RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
      .entryTtl(this.cacheProperties.getDefaultTtl())
      .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
      .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(RedisSerializer.json()))
      .disableCachingNullValues();

    final Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
    for (final CacheNames cacheName : CacheNames.values()) {
      final String name = cacheName.getCacheName();
      cacheConfigurations.put(name, defaultConfig.entryTtl(this.cacheProperties.getTtlFor(name)));
    }

    return RedisCacheManager.builder(connectionFactory)
      .cacheDefaults(defaultConfig)
      .withInitialCacheConfigurations(cacheConfigurations)
      .build();
  }

  @Override
  public CacheErrorHandler errorHandler() {
    return new RedisCacheErrorHandler();
  }
}
