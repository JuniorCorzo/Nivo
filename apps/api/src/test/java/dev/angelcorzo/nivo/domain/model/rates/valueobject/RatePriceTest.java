package dev.angelcorzo.nivo.domain.model.rates.valueobject;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.InvalidDomainException;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("RatePrice Value Object Tests")
class RatePriceTest {

  @Test
  @DisplayName("Should create valid RatePrice with BigDecimal")
  void shouldCreateValidRatePrice() {
    RatePrice ratePrice = RatePrice.of(new BigDecimal("5000.00"));

    assertThat(ratePrice.value()).isEqualByComparingTo(new BigDecimal("5000.00"));
  }

  @Test
  @DisplayName("Should create valid RatePrice from long")
  void shouldCreateValidRatePriceFromLong() {
    RatePrice ratePrice = RatePrice.of(5000L);

    assertThat(ratePrice.value()).isEqualByComparingTo(BigDecimal.valueOf(5000L));
  }

  @Test
  @DisplayName("Should allow zero price")
  void shouldAllowZeroPrice() {
    RatePrice zero = RatePrice.zero();
    RatePrice zeroFromBd = RatePrice.of(BigDecimal.ZERO);

    assertThat(zero.value()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(zeroFromBd.value()).isEqualByComparingTo(BigDecimal.ZERO);
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when value is null")
  void shouldThrowWhenValueIsNull() {
    assertThatThrownBy(() -> new RatePrice(null))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessageContaining("Rate price cannot be negative or null");

    assertThatThrownBy(() -> RatePrice.of((BigDecimal) null))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessageContaining("Rate price cannot be negative or null");
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when value is negative")
  void shouldThrowWhenValueIsNegative() {
    assertThatThrownBy(() -> RatePrice.of(new BigDecimal("-0.01")))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessageContaining("Rate price cannot be negative or null");

    assertThatThrownBy(() -> RatePrice.of(-100L))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessageContaining("Rate price cannot be negative or null");
  }

  @Test
  @DisplayName("Should be equal for same value")
  void shouldBeEqualForSameValue() {
    RatePrice price1 = RatePrice.of(new BigDecimal("1000"));
    RatePrice price2 = RatePrice.of(new BigDecimal("1000"));

    assertThat(price1).isEqualTo(price2);
    assertThat(price1.hashCode()).isEqualTo(price2.hashCode());
  }
}
