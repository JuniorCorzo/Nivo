package dev.angelcorzo.nivo.domain.model.commons.valueobjects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.InvalidDomainException;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("TaxRate Value Object Tests")
class TaxRateTest {

  @Test
  @DisplayName("Should create standard IVA tax rate with 0.19")
  void shouldCreateStandardIva() {
    TaxRate taxRate = TaxRate.standardIva();

    assertThat(taxRate.value()).isEqualByComparingTo(new BigDecimal("0.19"));
  }

  @Test
  @DisplayName("Should create valid tax rate with custom value")
  void shouldCreateValidTaxRate() {
    TaxRate taxRate = TaxRate.of(new BigDecimal("0.10"));

    assertThat(taxRate.value()).isEqualByComparingTo(new BigDecimal("0.10"));
  }

  @Test
  @DisplayName("Should allow boundary values 0.00 and 1.00")
  void shouldAllowBoundaryValues() {
    TaxRate zero = TaxRate.of(BigDecimal.ZERO);
    TaxRate full = TaxRate.of(BigDecimal.ONE);

    assertThat(zero.value()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(full.value()).isEqualByComparingTo(BigDecimal.ONE);
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when value is null")
  void shouldThrowWhenValueIsNull() {
    assertThatThrownBy(() -> new TaxRate(null))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessageContaining("Tax rate cannot be null");
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when value is negative")
  void shouldThrowWhenValueIsNegative() {
    assertThatThrownBy(() -> new TaxRate(new BigDecimal("-0.01")))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessageContaining("Tax rate must be between 0.00 and 1.00");
  }

  @Test
  @DisplayName("Should throw InvalidDomainException when value is greater than 1.00")
  void shouldThrowWhenValueIsGreaterThanOne() {
    assertThatThrownBy(() -> new TaxRate(new BigDecimal("1.01")))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessageContaining("Tax rate must be between 0.00 and 1.00");
  }

  @Test
  @DisplayName("calculateTax() should compute tax with scale 2 and HALF_UP rounding")
  void shouldCalculateTaxWithScaleTwoHalfUp() {
    TaxRate iva = TaxRate.standardIva();

    assertThat(iva.calculateTax(new BigDecimal("1000.00"))).isEqualByComparingTo(new BigDecimal("190.00"));
    assertThat(iva.calculateTax(new BigDecimal("100.55"))).isEqualByComparingTo(new BigDecimal("19.10"));
    assertThat(iva.calculateTax(new BigDecimal("100.56"))).isEqualByComparingTo(new BigDecimal("19.11"));
  }

  @Test
  @DisplayName("calculateTax() with zero tax rate should return zero")
  void shouldCalculateTaxWithZeroRate() {
    TaxRate zero = TaxRate.of(BigDecimal.ZERO);

    assertThat(zero.calculateTax(new BigDecimal("500.00"))).isEqualByComparingTo(BigDecimal.ZERO);
  }

  @Test
  @DisplayName("calculateTax() should throw InvalidDomainException when subtotal is null")
  void shouldThrowWhenSubtotalIsNull() {
    TaxRate iva = TaxRate.standardIva();

    assertThatThrownBy(() -> iva.calculateTax(null))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessageContaining("Subtotal cannot be null");
  }
}
