package dev.angelcorzo.nivo.infrastructure.security.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TokenBucketRateLimiterTest {

  @Test
  @DisplayName("Token Bucket: 60 peticiones consecutivas pasan, la 61 es rechazada con HTTP 429")
  void shouldAllow60RequestsAndReject61st() {
    final TokenBucketRateLimiter limiter = new TokenBucketRateLimiter(60, 60);
    final String clientIp = "192.168.1.100";

    for (int i = 0; i < 60; i++) {
      assertThat(limiter.tryConsume(clientIp)).isTrue();
    }
    assertThat(limiter.tryConsume(clientIp)).isFalse();
    assertThat(limiter.getRemainingTokens(clientIp)).isEqualTo(0);
    assertThat(limiter.getSecondsUntilRefill(clientIp)).isGreaterThan(0);
  }

  @Test
  @DisplayName("Token Bucket: buckets aislados por cliente")
  void shouldIsolateBucketsForDifferentClients() {
    final TokenBucketRateLimiter limiter = new TokenBucketRateLimiter(5, 5);
    final String ip1 = "10.0.0.1";
    final String ip2 = "10.0.0.2";

    for (int i = 0; i < 5; i++) {
      assertThat(limiter.tryConsume(ip1)).isTrue();
    }
    assertThat(limiter.tryConsume(ip1)).isFalse();
    assertThat(limiter.tryConsume(ip2)).isTrue();
  }

  @Test
  @DisplayName("Token Bucket: acceso concurrente sin bloqueos de monitor global")
  void shouldHandleConcurrentRequestsSafely() throws InterruptedException {
    final TokenBucketRateLimiter limiter = new TokenBucketRateLimiter(100, 100);
    final int threadCount = 20;
    final int requestsPerThread = 5;
    final ExecutorService executor = Executors.newFixedThreadPool(threadCount);
    final CountDownLatch latch = new CountDownLatch(1);
    final AtomicInteger successfulConsumes = new AtomicInteger(0);

    for (int i = 0; i < threadCount; i++) {
      final String clientIp = "10.0.0." + i;
      executor.submit(() -> {
        try {
          latch.await();
          for (int j = 0; j < requestsPerThread; j++) {
            if (limiter.tryConsume(clientIp)) {
              successfulConsumes.incrementAndGet();
            }
          }
        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
        }
      });
    }

    latch.countDown();
    executor.shutdown();
    assertThat(executor.awaitTermination(5, TimeUnit.SECONDS)).isTrue();
    assertThat(successfulConsumes.get()).isEqualTo(threadCount * requestsPerThread);
  }
}
