package dev.angelcorzo.nivo.infrastructure.adapter.cache.config;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for Redis distributed cache TTLs and defaults.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "nivo.cache")
public class RedisCacheProperties {

  private Duration defaultTtl = Duration.ofMinutes(10);
  private Map<String, Duration> ttls = new HashMap<>();

  public Duration getTtlFor(final String cacheName) {
    if (cacheName == null) {
      return this.defaultTtl;
    }
    return this.ttls.getOrDefault(cacheName, this.defaultTtl);
  }
}
