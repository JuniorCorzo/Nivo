package dev.angelcorzo.nivo.infrastructure.adapter.cache.constants;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Canonical cache names configured in RedisCacheManager.
 */
@Getter
@RequiredArgsConstructor
public enum CacheNames {
  SLOT_SUMMARY(CacheNames.SLOT_SUMMARY_KEY),
  RATES(CacheNames.RATES_KEY),
  PARKING_LOTS(CacheNames.PARKING_LOTS_KEY),
  PARKING_LOTS_LIST(CacheNames.PARKING_LOTS_LIST_KEY),
  SPECIAL_POLICIES(CacheNames.SPECIAL_POLICIES_KEY),
  PUBLIC_AVAILABILITY(CacheNames.PUBLIC_AVAILABILITY_KEY);

  public static final String SLOT_SUMMARY_KEY = "slot-summary";
  public static final String RATES_KEY = "rates";
  public static final String PARKING_LOTS_KEY = "parking-lots";
  public static final String PARKING_LOTS_LIST_KEY = "parking-lots-list";
  public static final String SPECIAL_POLICIES_KEY = "special-policies";
  public static final String PUBLIC_AVAILABILITY_KEY = "public-availability";

  private final String cacheName;

  public static CacheNames fromName(final String name) {
    if (name == null) {
      return null;
    }
    for (final CacheNames cache : values()) {
      if (cache.getCacheName().equalsIgnoreCase(name)) {
        return cache;
      }
    }
    return null;
  }
}
