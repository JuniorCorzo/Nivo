package dev.angelcorzo.nivo.infrastructure.adapter.cache.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cache.interceptor.CacheErrorHandler;

@DisplayName("RedisCacheConfig Unit Tests")
class RedisCacheConfigTest {

  @Test
  @DisplayName("Should supply RedisCacheErrorHandler from errorHandler bean method")
  void shouldSupplyRedisCacheErrorHandler() {
    final RedisCacheProperties properties = new RedisCacheProperties();
    final RedisCacheConfig config = new RedisCacheConfig(properties);

    final CacheErrorHandler handler = config.errorHandler();

    assertThat(handler).isNotNull().isInstanceOf(RedisCacheErrorHandler.class);
  }
}
