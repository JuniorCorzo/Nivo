package dev.angelcorzo.nivo.infrastructure.security.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TokenBucketRateLimiterTest {

  @Test
  @DisplayName("Token Bucket: 60 peticiones consecutivas pasan, la 61 es rechazada con HTTP 429")
  void shouldAllow60RequestsAndReject61st() {
    var limiter = new TokenBucketRateLimiter(60, 60);
    String clientIp = "192.168.1.100";

    for (int i = 0; i < 60; i++) {
      assertThat(limiter.tryConsume(clientIp)).isTrue();
    }
    assertThat(limiter.tryConsume(clientIp)).isFalse();
    assertThat(limiter.getRemainingTokens(clientIp)).isEqualTo(0);
    assertThat(limiter.getSecondsUntilRefill(clientIp)).isGreaterThan(0);
  }
}
