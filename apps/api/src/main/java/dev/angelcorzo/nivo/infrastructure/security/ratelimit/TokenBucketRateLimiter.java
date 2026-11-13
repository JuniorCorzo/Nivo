package dev.angelcorzo.nivo.infrastructure.security.ratelimit;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class TokenBucketRateLimiter {

  private static final int DEFAULT_MAX_BUCKETS = 10_000;

  private final long capacity;
  private final long refillTokensPerMinute;
  private final int maxBuckets;
  private final Map<String, Bucket> buckets;

  @org.springframework.beans.factory.annotation.Autowired
  public TokenBucketRateLimiter() {
    this(60, 60, DEFAULT_MAX_BUCKETS);
  }

  public TokenBucketRateLimiter(final long capacity, final long refillTokensPerMinute) {
    this(capacity, refillTokensPerMinute, DEFAULT_MAX_BUCKETS);
  }

  public TokenBucketRateLimiter(final long capacity, final long refillTokensPerMinute, final int maxBuckets) {
    this.capacity = capacity;
    this.refillTokensPerMinute = refillTokensPerMinute;
    this.maxBuckets = maxBuckets;
    this.buckets = Collections.synchronizedMap(
      new LinkedHashMap<>(128, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(final Map.Entry<String, Bucket> eldest) {
          return size() > TokenBucketRateLimiter.this.maxBuckets;
        }
      });
  }

  public boolean tryConsume(final String key) {
    return getOrCreateBucket(key).tryConsume();
  }

  public long getRemainingTokens(final String key) {
    return getOrCreateBucket(key).getAvailableTokens();
  }

  public long getSecondsUntilRefill(final String key) {
    return getOrCreateBucket(key).getSecondsUntilRefill();
  }

  private Bucket getOrCreateBucket(final String key) {
    synchronized (buckets) {
      return buckets.computeIfAbsent(key, k -> new Bucket(capacity, refillTokensPerMinute));
    }
  }

  private static class Bucket {
    private final long capacity;
    private final double refillRatePerMs;
    private double tokens;
    private long lastRefillTime;

    Bucket(final long capacity, final long refillTokensPerMinute) {
      this.capacity = capacity;
      this.refillRatePerMs = (double) refillTokensPerMinute / 60000.0;
      this.tokens = capacity;
      this.lastRefillTime = System.currentTimeMillis();
    }

    synchronized boolean tryConsume() {
      refill();
      if (tokens >= 1.0) {
        tokens -= 1.0;
        return true;
      }
      return false;
    }

    synchronized long getAvailableTokens() {
      refill();
      return (long) tokens;
    }

    synchronized long getSecondsUntilRefill() {
      refill();
      if (tokens >= 1.0) {
        return 0;
      }
      final double missing = 1.0 - tokens;
      final long msNeeded = (long) Math.ceil(missing / refillRatePerMs);
      return Math.max(1, (msNeeded + 999) / 1000);
    }

    private void refill() {
      final long now = System.currentTimeMillis();
      final long delta = now - lastRefillTime;
      if (delta > 0) {
        tokens = Math.min(capacity, tokens + delta * refillRatePerMs);
        lastRefillTime = now;
      }
    }
  }
}
