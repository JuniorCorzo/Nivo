package dev.angelcorzo.nivo.infrastructure.adapter.cache.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.interceptor.CacheErrorHandler;

/**
 * Transparent error handler for Redis cache operations.
 *
 * <p>
 * Logs failures without throwing exceptions to ensure graceful degradation to the database (fallback) when the Redis
 * node is unavailable or experiences transient network errors.
 */
@Slf4j
public class RedisCacheErrorHandler implements CacheErrorHandler {

  @Override
  public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
    log.warn("Redis GET failed for cache='{}', key='{}'. Falling back to database. Cause: {}",
      cache.getName(), key, exception.getMessage());
  }

  @Override
  public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
    log.warn("Redis PUT failed for cache='{}', key='{}'. Cause: {}",
      cache.getName(), key, exception.getMessage());
  }

  @Override
  public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
    log.warn("Redis EVICT failed for cache='{}', key='{}'. Cause: {}",
      cache.getName(), key, exception.getMessage());
  }

  @Override
  public void handleCacheClearError(RuntimeException exception, Cache cache) {
    log.warn("Redis CLEAR failed for cache='{}'. Cause: {}",
      cache.getName(), exception.getMessage());
  }
}
