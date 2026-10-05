package dev.angelcorzo.nivo.domain.model.rates.valueobject;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.InvalidDomainException;
import java.time.Duration;

public record MinChargeDuration(int minutes) {

  public MinChargeDuration {
    if (minutes < 0) {
      throw new InvalidDomainException("Minimum charge minutes cannot be negative");
    }
  }

  public static MinChargeDuration of(int minutes) {
    return new MinChargeDuration(minutes);
  }

  public static MinChargeDuration zero() {
    return new MinChargeDuration(0);
  }

  public Duration toDuration() {
    return Duration.ofMinutes(this.minutes);
  }
}
