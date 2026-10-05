package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("BaseRateStage Tests")
class BaseRateStageTest {

  private final BaseRateStage stage = new BaseRateStage();

  @Test
  @DisplayName("Should skip calculation if context is already settled")
  void shouldSkipWhenSettled() {
    RateReference rate = RateReference.builder()
        .pricePerUnit(BigDecimal.valueOf(5000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(0)
        .build();

    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, entry.plusMinutes(120)).toSettled();

    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.breakpoints()).isEmpty();
  }

  @Test
  @DisplayName("Should skip calculation and preserve existing values if context settled with previous charge")
  void shouldSkipAndPreserveWhenSettledWithCharge() {
    RateReference rate = RateReference.builder()
        .pricePerUnit(BigDecimal.valueOf(5000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(0)
        .build();

    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    PriceLine existingLine = PriceLine.of("Grace period", new BigDecimal("500.00"));
    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, entry.plusMinutes(10))
        .withSubtotal(new BigDecimal("500.00"), existingLine)
        .toSettled();

    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("500.00"));
    assertThat(result.breakpoints()).containsExactly(existingLine);
  }

  @Test
  @DisplayName("Should calculate base rate with ceil fraction and min charge")
  void shouldCalculateBaseRate() {
    RateReference rate = RateReference.builder()
        .id(UUID.randomUUID())
        .name("Car Hourly")
        .pricePerUnit(BigDecimal.valueOf(3000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(60)
        .vehicleType(VehicleType.CAR)
        .build();

    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    // 90 minutes = 2 hours billed with ceil (60 min minCharge respected)
    OffsetDateTime exit = entry.plusMinutes(90);

    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("6000.00"));
    assertThat(result.breakpoints()).hasSize(1);
    assertThat(result.breakpoints().getFirst().concept()).contains("Car Hourly");
    assertThat(result.breakpoints().getFirst().amount()).isEqualByComparingTo(new BigDecimal("6000.00"));
  }

  @Test
  @DisplayName("Should respect minimum charge time when actual duration is shorter")
  void shouldRespectMinChargeTimeWhenDurationIsShorter() {
    RateReference rate = RateReference.builder()
        .id(UUID.randomUUID())
        .name("Motorcycle Hourly")
        .pricePerUnit(BigDecimal.valueOf(2000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(60)
        .vehicleType(VehicleType.MOTORCYCLE)
        .build();

    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    // 25 minutes < 60 min minCharge -> effective is 60 min -> 1 hour billed
    OffsetDateTime exit = entry.plusMinutes(25);

    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("2000.00"));
    assertThat(result.breakpoints()).hasSize(1);
    assertThat(result.breakpoints().getFirst().concept()).contains("Motorcycle Hourly");
    assertThat(result.breakpoints().getFirst().amount()).isEqualByComparingTo(new BigDecimal("2000.00"));
  }

  @Test
  @DisplayName("Should calculate base rate for minute time unit")
  void shouldCalculateWithMinuteTimeUnit() {
    RateReference rate = RateReference.builder()
        .id(UUID.randomUUID())
        .name("Car Per Minute")
        .pricePerUnit(BigDecimal.valueOf(100))
        .timeUnit(TimeUnitsRate.MINUTES)
        .minChargeTimeMinutes(10)
        .vehicleType(VehicleType.CAR)
        .build();

    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    // 25 minutes >= 10 min minCharge -> 25 minutes billed
    OffsetDateTime exit = entry.plusMinutes(25);

    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("2500.00"));
    assertThat(result.breakpoints()).hasSize(1);
    assertThat(result.breakpoints().getFirst().concept()).contains("Car Per Minute");
    assertThat(result.breakpoints().getFirst().amount()).isEqualByComparingTo(new BigDecimal("2500.00"));
  }

  @Test
  @DisplayName("Should calculate base rate for day time unit with ceiling")
  void shouldCalculateWithDayTimeUnit() {
    RateReference rate = RateReference.builder()
        .id(UUID.randomUUID())
        .name("Car Daily")
        .pricePerUnit(BigDecimal.valueOf(25000))
        .timeUnit(TimeUnitsRate.DAYS)
        .minChargeTimeMinutes(0)
        .vehicleType(VehicleType.CAR)
        .build();

    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    // 36 hours = 1.5 days -> ceiling 2 days
    OffsetDateTime exit = entry.plusHours(36);

    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("50000.00"));
    assertThat(result.breakpoints()).hasSize(1);
    assertThat(result.breakpoints().getFirst().concept()).contains("Car Daily");
    assertThat(result.breakpoints().getFirst().amount()).isEqualByComparingTo(new BigDecimal("50000.00"));
  }
}
