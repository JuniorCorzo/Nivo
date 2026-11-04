package dev.angelcorzo.nivo.infrastructure.adapter.cache.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("RedisCacheProperties Unit Tests")
class RedisCachePropertiesTest {

  @Test
  @DisplayName("Should return configured TTL when present")
  void shouldReturnConfiguredTtl() {
    final RedisCacheProperties properties = new RedisCacheProperties();
    properties.setTtls(Map.of("rates", Duration.ofHours(5)));

    final Duration ttl = properties.getTtlFor("rates");

    assertThat(ttl).isEqualTo(Duration.ofHours(5));
  }

  @Test
  @DisplayName("Should fallback to default TTL when name is unconfigured or null")
  void shouldFallbackToDefaultTtl() {
    final RedisCacheProperties properties = new RedisCacheProperties();
    properties.setDefaultTtl(Duration.ofMinutes(15));

    assertThat(properties.getTtlFor("unknown-cache")).isEqualTo(Duration.ofMinutes(15));
    assertThat(properties.getTtlFor(null)).isEqualTo(Duration.ofMinutes(15));
  }
}
