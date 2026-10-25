package dev.angelcorzo.nivo.domain.usecase.dashboard.calculator;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class DashboardMetricsCalculatorTest {

  @Test
  @DisplayName("Should return null delta when previous revenue is null")
  void shouldReturnNullWhenPreviousRevenueIsNull() {
    assertThat(DashboardMetricsCalculator.calculateRevenueDeltaPercentage(new BigDecimal("100"), null)).isNull();
  }

  @Test
  @DisplayName("Should return 100% delta when previous revenue is zero and current is positive")
  void shouldReturnHundredPercentWhenPreviousIsZeroAndCurrentIsPositive() {
    assertThat(DashboardMetricsCalculator.calculateRevenueDeltaPercentage(new BigDecimal("500"), BigDecimal.ZERO))
      .isEqualTo(100.0);
  }

  @Test
  @DisplayName("Should return 0% delta when both current and previous revenue are zero")
  void shouldReturnZeroPercentWhenBothRevenuesAreZero() {
    assertThat(DashboardMetricsCalculator.calculateRevenueDeltaPercentage(BigDecimal.ZERO, BigDecimal.ZERO))
      .isEqualTo(0.0);
  }

  @Test
  @DisplayName("Should calculate positive revenue delta percentage correctly")
  void shouldCalculatePositiveRevenueDelta() {
    final BigDecimal cur = new BigDecimal("150.00");
    final BigDecimal prev = new BigDecimal("100.00");
    assertThat(DashboardMetricsCalculator.calculateRevenueDeltaPercentage(cur, prev)).isEqualTo(50.0);
  }

  @Test
  @DisplayName("Should calculate negative revenue delta percentage correctly")
  void shouldCalculateNegativeRevenueDelta() {
    final BigDecimal cur = new BigDecimal("75.00");
    final BigDecimal prev = new BigDecimal("100.00");
    assertThat(DashboardMetricsCalculator.calculateRevenueDeltaPercentage(cur, prev)).isEqualTo(-25.0);
  }

  @Test
  @DisplayName("Should return null stay delta when current or previous stay is null")
  void shouldReturnNullStayDeltaWhenInputsAreNull() {
    assertThat(DashboardMetricsCalculator.calculateAvgStayDeltaMinutes(null, 30.0)).isNull();
    assertThat(DashboardMetricsCalculator.calculateAvgStayDeltaMinutes(30.0, null)).isNull();
  }

  @Test
  @DisplayName("Should calculate average stay delta correctly")
  void shouldCalculateAvgStayDelta() {
    assertThat(DashboardMetricsCalculator.calculateAvgStayDeltaMinutes(45.5, 30.0)).isEqualTo(15.5);
    assertThat(DashboardMetricsCalculator.calculateAvgStayDeltaMinutes(20.0, 30.0)).isEqualTo(-10.0);
  }

  @Test
  @DisplayName("Should return zero digital payment ratio when total revenue is zero or null")
  void shouldReturnZeroDigitalPaymentRatioWhenTotalZeroOrNull() {
    assertThat(DashboardMetricsCalculator.calculateDigitalPaymentRatio(null, new BigDecimal("50"))).isEqualTo(0.0);
    assertThat(DashboardMetricsCalculator.calculateDigitalPaymentRatio(BigDecimal.ZERO, new BigDecimal("50")))
      .isEqualTo(0.0);
  }

  @Test
  @DisplayName("Should calculate digital payment ratio correctly")
  void shouldCalculateDigitalPaymentRatio() {
    final BigDecimal total = new BigDecimal("200.00");
    final BigDecimal digital = new BigDecimal("50.00");
    assertThat(DashboardMetricsCalculator.calculateDigitalPaymentRatio(total, digital)).isEqualTo(25.0);
  }

  @Test
  @DisplayName("Should return zero when digital revenue is null")
  void shouldReturnZeroWhenDigitalRevenueIsNull() {
    final BigDecimal total = new BigDecimal("200.00");
    assertThat(DashboardMetricsCalculator.calculateDigitalPaymentRatio(total, null)).isEqualTo(0.0);
  }
}
