package dev.angelcorzo.nivo.infrastructure.adapter.cache.config;

import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;

@DisplayName("RedisCacheErrorHandler Unit Tests")
class RedisCacheErrorHandlerTest {

  private RedisCacheErrorHandler errorHandler;
  private Cache cache;

  @BeforeEach
  void setUp() {
    errorHandler = new RedisCacheErrorHandler();
    cache = mock(Cache.class);
    when(cache.getName()).thenReturn("test-cache");
  }

  @Test
  @DisplayName("Should suppress and log cache GET error without throwing")
  void shouldHandleCacheGetError() {
    final RuntimeException ex = new RuntimeException("Redis connection refused");

    assertThatNoException()
      .isThrownBy(() -> errorHandler.handleCacheGetError(ex, cache, "key-123"));
  }

  @Test
  @DisplayName("Should suppress and log cache PUT error without throwing")
  void shouldHandleCachePutError() {
    final RuntimeException ex = new RuntimeException("Redis timeout on PUT");

    assertThatNoException()
      .isThrownBy(() -> errorHandler.handleCachePutError(ex, cache, "key-123", "val-abc"));
  }

  @Test
  @DisplayName("Should suppress and log cache EVICT error without throwing")
  void shouldHandleCacheEvictError() {
    final RuntimeException ex = new RuntimeException("Redis command failed on EVICT");

    assertThatNoException()
      .isThrownBy(() -> errorHandler.handleCacheEvictError(ex, cache, "key-123"));
  }

  @Test
  @DisplayName("Should suppress and log cache CLEAR error without throwing")
  void shouldHandleCacheClearError() {
    final RuntimeException ex = new RuntimeException("Redis node unavailable on CLEAR");

    assertThatNoException()
      .isThrownBy(() -> errorHandler.handleCacheClearError(ex, cache));
  }
}
