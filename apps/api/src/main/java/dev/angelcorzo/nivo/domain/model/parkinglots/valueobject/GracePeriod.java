package dev.angelcorzo.nivo.domain.model.parkinglots.valueobject;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.InvalidDomainException;
import java.math.BigDecimal;
import java.time.Duration;

public record GracePeriod(int minutes, BigDecimal price) {

  public GracePeriod {
    if (minutes < 0) {
      throw new InvalidDomainException("Grace period minutes must be non-negative");
    }
    if (price == null) {
      throw new InvalidDomainException("Grace period price cannot be null");
    }
    if (price.compareTo(BigDecimal.ZERO) < 0) {
      throw new InvalidDomainException("Grace period price must be non-negative");
    }
    if (minutes == 0 && price.compareTo(BigDecimal.ZERO) > 0) {
      throw new InvalidDomainException("Cannot set a price for a zero-minute grace period");
    }
  }

  public static GracePeriod none() {
    return new GracePeriod(0, BigDecimal.ZERO);
  }

  public static GracePeriod of(int minutes, BigDecimal price) {
    return new GracePeriod(minutes, price);
  }

  public boolean isPresent() {
    return this.minutes > 0;
  }

  public boolean isFree() {
    return BigDecimal.ZERO.compareTo(this.price) == 0;
  }

  public Duration toDuration() {
    return Duration.ofMinutes(this.minutes);
  }

  public boolean covers(Duration duration) {
    if (!isPresent() || duration == null || duration.isNegative()) {
      return false;
    }
    return duration.compareTo(toDuration()) <= 0;
  }
}
