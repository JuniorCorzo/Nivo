package dev.angelcorzo.nivo.domain.model.parkinglots.valueobject;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.InvalidDomainException;
import java.math.BigDecimal;
import java.time.Duration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("GracePeriod Value Object Tests")
class GracePeriodTest {

  @Test
  @DisplayName("Should create valid priced grace period")
  void shouldCreateValidPricedGracePeriod() {
    GracePeriod gracePeriod = GracePeriod.of(15, new BigDecimal("500.00"));

    assertThat(gracePeriod.minutes()).isEqualTo(15);
    assertThat(gracePeriod.price()).isEqualByComparingTo(new BigDecimal("500.00"));
    assertThat(gracePeriod.isPresent()).isTrue();
    assertThat(gracePeriod.isFree()).isFalse();
  }

  @Test
  @DisplayName("Should create valid free grace period")
  void shouldCreateValidFreeGracePeriod() {
    GracePeriod gracePeriod = GracePeriod.of(15, BigDecimal.ZERO);

    assertThat(gracePeriod.minutes()).isEqualTo(15);
    assertThat(gracePeriod.price()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(gracePeriod.isPresent()).isTrue();
    assertThat(gracePeriod.isFree()).isTrue();
  }

  @Test
  @DisplayName("none() should create zero-minute free grace period")
  void shouldCreateNoneGracePeriod() {
    GracePeriod gracePeriod = GracePeriod.none();

    assertThat(gracePeriod.minutes()).isZero();
    assertThat(gracePeriod.price()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(gracePeriod.isPresent()).isFalse();
    assertThat(gracePeriod.isFree()).isTrue();
  }

  @Test
  @DisplayName("toDuration() should return matching duration")
  void shouldConvertToDuration() {
    GracePeriod gracePeriod = GracePeriod.of(20, BigDecimal.ZERO);

    assertThat(gracePeriod.toDuration()).isEqualTo(Duration.ofMinutes(20));
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when minutes are negative")
  void shouldThrowWhenMinutesNegative() {
    assertThatThrownBy(() -> new GracePeriod(-1, BigDecimal.ZERO))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessageContaining("Grace period minutes must be non-negative");
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when price is null")
  void shouldThrowWhenPriceNull() {
    assertThatThrownBy(() -> new GracePeriod(15, null))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessageContaining("Grace period price cannot be null");
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when price is negative")
  void shouldThrowWhenPriceNegative() {
    assertThatThrownBy(() -> new GracePeriod(15, new BigDecimal("-10.00")))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessageContaining("Grace period price must be non-negative");
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when zero minutes has a positive price")
  void shouldThrowWhenZeroMinutesWithPositivePrice() {
    assertThatThrownBy(() -> new GracePeriod(0, new BigDecimal("100.00")))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessage("Cannot set a price for a zero-minute grace period");
  }

  @Test
  @DisplayName("covers() should return true when duration is within grace period")
  void shouldCoverDurationWithinLimit() {
    GracePeriod gracePeriod = GracePeriod.of(15, BigDecimal.ZERO);

    assertThat(gracePeriod.covers(Duration.ofMinutes(10))).isTrue();
    assertThat(gracePeriod.covers(Duration.ZERO)).isTrue();
  }

  @Test
  @DisplayName("covers() should return true when duration is exactly at grace period limit")
  void shouldCoverDurationAtExactLimit() {
    GracePeriod gracePeriod = GracePeriod.of(15, BigDecimal.ZERO);

    assertThat(gracePeriod.covers(Duration.ofMinutes(15))).isTrue();
  }

  @Test
  @DisplayName("covers() should return false when duration exceeds grace period")
  void shouldNotCoverDurationExceedingLimit() {
    GracePeriod gracePeriod = GracePeriod.of(15, BigDecimal.ZERO);

    assertThat(gracePeriod.covers(Duration.ofMinutes(16))).isFalse();
  }

  @Test
  @DisplayName("covers() should return false when grace period is not present")
  void shouldNotCoverWhenNotPresent() {
    GracePeriod gracePeriod = GracePeriod.none();

    assertThat(gracePeriod.covers(Duration.ZERO)).isFalse();
    assertThat(gracePeriod.covers(Duration.ofMinutes(5))).isFalse();
  }

  @Test
  @DisplayName("covers() should return false when duration is null or negative")
  void shouldNotCoverWhenDurationNullOrNegative() {
    GracePeriod gracePeriod = GracePeriod.of(15, BigDecimal.ZERO);

    assertThat(gracePeriod.covers(null)).isFalse();
    assertThat(gracePeriod.covers(Duration.ofMinutes(-5))).isFalse();
  }
}
