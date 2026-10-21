package dev.angelcorzo.nivo.domain.model.rates.valueobject;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.InvalidDomainException;
import java.math.BigDecimal;

public record RatePrice(BigDecimal value) {

  public RatePrice {
    if (value == null || value.compareTo(BigDecimal.ZERO) < 0) {
      throw new InvalidDomainException("Rate price cannot be negative or null");
    }
  }

  public static RatePrice of(BigDecimal value) {
    return new RatePrice(value);
  }

  public static RatePrice of(long value) {
    return new RatePrice(BigDecimal.valueOf(value));
  }

  public static RatePrice zero() {
    return new RatePrice(BigDecimal.ZERO);
  }
}
