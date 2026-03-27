package dev.angelcorzo.nivo.usecase.calculaterate.utils;

import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.temporal.TemporalUnit;
import java.util.Objects;

@NoArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public final class ParkingFeeCalculator {
  /**
   * Calculates the parking fee based on the duration and the specified rate parameters.
   *
   * @param duration     The actual duration of the parking.
   * @param fee          The fee per time unit.
   * @param minDuration  The minimum duration to be charged.
   * @param timeUnit     The time unit for the fee (e.g., hours, minutes).
   * @param roundingMode The rounding mode to apply to the final fee.
   * @return The calculated parking fee.
   * @throws NullPointerException if any of the parameters are null.
   */
  public static BigDecimal calculateFee(
      Duration duration,
      BigDecimal fee,
      Duration minDuration,
      TemporalUnit timeUnit,
      RoundingMode roundingMode) {
    Objects.requireNonNull(duration, "Duration cannot be null");
    Objects.requireNonNull(fee, "Fee cannot be null");
    Objects.requireNonNull(minDuration, "Min duration cannot be null");
    Objects.requireNonNull(timeUnit, "Time unit cannot be null");
    Objects.requireNonNull(roundingMode, "Rounding mode cannot be null");

    final long effective =
        duration.compareTo(minDuration) >= 0 ? duration.toMillis() : minDuration.toMillis();

    final Duration unitDuration = transfomDuration(1L, timeUnit);

    final long billedUnits = Math.ceilDiv(effective, unitDuration.toMillis());
    return fee.multiply(BigDecimal.valueOf(billedUnits)).setScale(2, roundingMode);
  }

  /**
   * Transforms a given amount and time unit into a Duration object.
   *
   * @param amount   The amount of time.
   * @param timeUnit The unit of time.
   * @return The corresponding Duration object.
   * @throws IllegalArgumentException if the resulting duration is invalid (negative).
   */
  public static Duration transfomDuration(Long amount, TemporalUnit timeUnit) {
    final Duration timeDuration = Duration.of(amount, timeUnit);
    if (timeDuration.toMillis() < 0) throw new IllegalArgumentException("Invalid time unit");

    return timeDuration;
  }
}
