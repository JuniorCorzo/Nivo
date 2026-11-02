package dev.angelcorzo.nivo.infrastructure.adapter.cache.config;

import dev.angelcorzo.nivo.infrastructure.adapter.cache.constants.CacheNames;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
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
 * Sets up RedisCacheManager with entity-specific TTLs, JSON serialization, and transparent fallback error handling.
 */
@Configuration
@EnableCaching
public class RedisCacheConfig implements CachingConfigurer {

  @Bean
  public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
    final RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
      .entryTtl(Duration.ofMinutes(10))
      .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
      .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(RedisSerializer.json()))
      .disableCachingNullValues();

    final Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
    cacheConfigurations.put(CacheNames.SLOT_SUMMARY, defaultConfig.entryTtl(Duration.ofMinutes(3)));
    cacheConfigurations.put(CacheNames.RATES, defaultConfig.entryTtl(Duration.ofHours(1)));
    cacheConfigurations.put(CacheNames.PARKING_LOTS, defaultConfig.entryTtl(Duration.ofMinutes(30)));

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
