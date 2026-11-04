package dev.angelcorzo.nivo.infrastructure.adapter.cache.constants;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("CacheNames Enum Unit Tests")
class CacheNamesTest {

  @Test
  @DisplayName("Should resolve enum from valid cache name case-insensitively")
  void shouldResolveFromName() {
    assertThat(CacheNames.fromName("slot-summary")).isEqualTo(CacheNames.SLOT_SUMMARY);
    assertThat(CacheNames.fromName("SLOT-SUMMARY")).isEqualTo(CacheNames.SLOT_SUMMARY);
    assertThat(CacheNames.fromName("rates")).isEqualTo(CacheNames.RATES);
    assertThat(CacheNames.fromName("parking-lots")).isEqualTo(CacheNames.PARKING_LOTS);
    assertThat(CacheNames.fromName("parking-lots-list")).isEqualTo(CacheNames.PARKING_LOTS_LIST);
    assertThat(CacheNames.fromName("special-policies")).isEqualTo(CacheNames.SPECIAL_POLICIES);
    assertThat(CacheNames.fromName("public-availability")).isEqualTo(CacheNames.PUBLIC_AVAILABILITY);
  }

  @Test
  @DisplayName("Should return null for unknown or null name")
  void shouldReturnNullForUnknownOrNull() {
    assertThat(CacheNames.fromName(null)).isNull();
    assertThat(CacheNames.fromName("non-existent-cache")).isNull();
  }

  @Test
  @DisplayName("Should expose expected string constants")
  void shouldExposeStringConstants() {
    assertThat(CacheNames.SLOT_SUMMARY.getCacheName()).isEqualTo(CacheNames.SLOT_SUMMARY_KEY);
    assertThat(CacheNames.RATES.getCacheName()).isEqualTo(CacheNames.RATES_KEY);
    assertThat(CacheNames.PARKING_LOTS.getCacheName()).isEqualTo(CacheNames.PARKING_LOTS_KEY);
    assertThat(CacheNames.PARKING_LOTS_LIST.getCacheName()).isEqualTo(CacheNames.PARKING_LOTS_LIST_KEY);
    assertThat(CacheNames.SPECIAL_POLICIES.getCacheName()).isEqualTo(CacheNames.SPECIAL_POLICIES_KEY);
    assertThat(CacheNames.PUBLIC_AVAILABILITY.getCacheName()).isEqualTo(CacheNames.PUBLIC_AVAILABILITY_KEY);
  }
}
