package dev.angelcorzo.nivo.infrastructure.adapter.cache.config;

import static org.assertj.core.api.Assertions.assertThatCode;
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
  @DisplayName("Should suppress GET errors and not throw exception")
  void shouldSuppressGetError() {
    assertThatCode(() -> errorHandler.handleCacheGetError(new RuntimeException("Connection timeout"), cache, "key-1"))
      .doesNotThrowAnyException();
  }

  @Test
  @DisplayName("Should suppress PUT errors and not throw exception")
  void shouldSuppressPutError() {
    assertThatCode(
      () -> errorHandler.handleCachePutError(new RuntimeException("Redis unavailable"), cache, "key-1", "val-1"))
      .doesNotThrowAnyException();
  }

  @Test
  @DisplayName("Should suppress EVICT errors and not throw exception")
  void shouldSuppressEvictError() {
    assertThatCode(() -> errorHandler.handleCacheEvictError(new RuntimeException("Write timeout"), cache, "key-1"))
      .doesNotThrowAnyException();
  }

  @Test
  @DisplayName("Should suppress CLEAR errors and not throw exception")
  void shouldSuppressClearError() {
    assertThatCode(() -> errorHandler.handleCacheClearError(new RuntimeException("Cluster down"), cache))
      .doesNotThrowAnyException();
  }
}
