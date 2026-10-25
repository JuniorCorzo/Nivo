package dev.angelcorzo.nivo.domain.usecase.dashboard.calculator;

import java.math.BigDecimal;

public final class DashboardMetricsCalculator {

  private DashboardMetricsCalculator() {
    // Utility class
  }

  public static Double calculateRevenueDeltaPercentage(final BigDecimal currentRevenue,
    final BigDecimal previousRevenue) {
    if (previousRevenue == null) {
      return null;
    }
    if (previousRevenue.compareTo(BigDecimal.ZERO) > 0) {
      final double cur = currentRevenue != null ? currentRevenue.doubleValue() : 0.0;
      final double prev = previousRevenue.doubleValue();
      final double delta = ((cur - prev) / prev) * 100.0;
      return Math.round(delta * 10.0) / 10.0;
    }
    if (currentRevenue != null && currentRevenue.compareTo(BigDecimal.ZERO) > 0) {
      return 100.0;
    }
    return 0.0;
  }

  public static Double calculateAvgStayDeltaMinutes(final Double currentAvgStay, final Double previousAvgStay) {
    if (currentAvgStay == null || previousAvgStay == null) {
      return null;
    }
    final double delta = currentAvgStay - previousAvgStay;
    return Math.round(delta * 10.0) / 10.0;
  }

  public static Double calculateDigitalPaymentRatio(final BigDecimal totalRevenue, final BigDecimal digitalRevenue) {
    if (totalRevenue == null || totalRevenue.compareTo(BigDecimal.ZERO) <= 0) {
      return 0.0;
    }
    final double total = totalRevenue.doubleValue();
    final double digital = digitalRevenue != null ? digitalRevenue.doubleValue() : 0.0;
    final double ratio = (digital / total) * 100.0;
    return Math.round(ratio * 10.0) / 10.0;
  }
}
