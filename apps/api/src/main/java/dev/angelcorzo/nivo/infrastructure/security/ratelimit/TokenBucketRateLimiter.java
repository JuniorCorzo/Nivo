package dev.angelcorzo.nivo.infrastructure.security.ratelimit;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class TokenBucketRateLimiter {

  private final long capacity;
  private final long refillTokensPerMinute;
  private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

  public TokenBucketRateLimiter() {
    this(60, 60);
  }

  public TokenBucketRateLimiter(long capacity, long refillTokensPerMinute) {
    this.capacity = capacity;
    this.refillTokensPerMinute = refillTokensPerMinute;
  }

  public boolean tryConsume(String key) {
    Bucket bucket = buckets.computeIfAbsent(key, k -> new Bucket(capacity, refillTokensPerMinute));
    return bucket.tryConsume();
  }

  public long getRemainingTokens(String key) {
    Bucket bucket = buckets.computeIfAbsent(key, k -> new Bucket(capacity, refillTokensPerMinute));
    return bucket.getAvailableTokens();
  }

  public long getSecondsUntilRefill(String key) {
    Bucket bucket = buckets.computeIfAbsent(key, k -> new Bucket(capacity, refillTokensPerMinute));
    return bucket.getSecondsUntilRefill();
  }

  private static class Bucket {
    private final long capacity;
    private final double refillRatePerMs;
    private double tokens;
    private long lastRefillTime;

    Bucket(long capacity, long refillTokensPerMinute) {
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
      double missing = 1.0 - tokens;
      long msNeeded = (long) Math.ceil(missing / refillRatePerMs);
      return Math.max(1, (msNeeded + 999) / 1000);
    }

    private void refill() {
      long now = System.currentTimeMillis();
      long delta = now - lastRefillTime;
      if (delta > 0) {
        tokens = Math.min(capacity, tokens + delta * refillRatePerMs);
        lastRefillTime = now;
      }
    }
  }
}
