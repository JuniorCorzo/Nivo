package dev.angelcorzo.nivo.domain.model.rates.valueobject;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.InvalidDomainException;
import java.time.Duration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("MinChargeDuration Value Object Tests")
class MinChargeDurationTest {

  @Test
  @DisplayName("Should create valid MinChargeDuration")
  void shouldCreateValidMinChargeDuration() {
    MinChargeDuration duration = MinChargeDuration.of(15);

    assertThat(duration.minutes()).isEqualTo(15);
  }

  @Test
  @DisplayName("Should create zero MinChargeDuration")
  void shouldCreateZeroMinChargeDuration() {
    MinChargeDuration zero = MinChargeDuration.zero();
    MinChargeDuration zeroFromOf = MinChargeDuration.of(0);

    assertThat(zero.minutes()).isZero();
    assertThat(zeroFromOf.minutes()).isZero();
  }

  @Test
  @DisplayName("Should convert to java.time.Duration")
  void shouldConvertToDuration() {
    MinChargeDuration duration = MinChargeDuration.of(30);

    assertThat(duration.toDuration()).isEqualTo(Duration.ofMinutes(30));
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when minutes are negative")
  void shouldThrowWhenMinutesAreNegative() {
    assertThatThrownBy(() -> new MinChargeDuration(-1))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessageContaining("Minimum charge minutes cannot be negative");

    assertThatThrownBy(() -> MinChargeDuration.of(-15))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessageContaining("Minimum charge minutes cannot be negative");
  }

  @Test
  @DisplayName("Should be equal for same minutes")
  void shouldBeEqualForSameMinutes() {
    MinChargeDuration duration1 = MinChargeDuration.of(20);
    MinChargeDuration duration2 = MinChargeDuration.of(20);

    assertThat(duration1).isEqualTo(duration2);
    assertThat(duration1.hashCode()).isEqualTo(duration2.hashCode());
  }
}
