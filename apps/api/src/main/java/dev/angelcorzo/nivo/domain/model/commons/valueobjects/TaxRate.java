package dev.angelcorzo.nivo.domain.model.commons.valueobjects;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.InvalidDomainException;
import java.math.BigDecimal;
import java.math.RoundingMode;

public record TaxRate(BigDecimal value) {

  private static final BigDecimal STANDARD_IVA = new BigDecimal("0.19");

  public TaxRate {
    if (value == null) {
      throw new InvalidDomainException("Tax rate cannot be null");
    }
    if (value.compareTo(BigDecimal.ZERO) < 0 || value.compareTo(BigDecimal.ONE) > 0) {
      throw new InvalidDomainException("Tax rate must be between 0.00 and 1.00");
    }
  }

  public static TaxRate standardIva() {
    return new TaxRate(STANDARD_IVA);
  }

  public static TaxRate of(BigDecimal value) {
    return new TaxRate(value);
  }

  public static TaxRate of(String value) {
    if (value == null) {
      throw new InvalidDomainException("Tax rate cannot be null");
    }
    return new TaxRate(new BigDecimal(value));
  }

  public BigDecimal calculateTax(BigDecimal subtotal) {
    if (subtotal == null) {
      throw new InvalidDomainException("Subtotal cannot be null");
    }
    return subtotal.multiply(this.value).setScale(2, RoundingMode.HALF_UP);
  }
}
