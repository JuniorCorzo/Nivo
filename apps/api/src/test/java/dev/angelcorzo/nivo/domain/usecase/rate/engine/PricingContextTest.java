package dev.angelcorzo.nivo.domain.usecase.rate.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.InvalidDomainException;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("PricingContext Tests")
class PricingContextTest {

  @Test
  @DisplayName("of() with StayInterval should initialize context and expose stayInterval and delegations")
  void shouldInitializeContextWithStayInterval() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T11:30:00Z");
    StayInterval interval = StayInterval.of(entry, exit);

    RateReference rate = RateReference.builder()
        .id(UUID.randomUUID())
        .pricePerUnit(BigDecimal.valueOf(5000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(0)
        .vehicleType(VehicleType.CAR)
        .build();

    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), interval);

    assertThat(ctx.stayInterval()).isEqualTo(interval);
    assertThat(ctx.duration()).isEqualTo(Duration.ofMinutes(90));
    assertThat(ctx.entryTime()).isEqualTo(entry);
    assertThat(ctx.exitTime()).isEqualTo(exit);
    assertThat(ctx.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(ctx.breakpoints()).isEmpty();
    assertThat(ctx.settled()).isFalse();
  }

  @Test
  @DisplayName("legacy of() should calculate duration and initialize subtotal to zero")
  void shouldInitializeContext() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T11:30:00Z");

    RateReference rate = RateReference.builder()
        .id(UUID.randomUUID())
        .pricePerUnit(BigDecimal.valueOf(5000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(0)
        .vehicleType(VehicleType.CAR)
        .build();

    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, exit);

    assertThat(ctx.stayInterval()).isNotNull();
    assertThat(ctx.stayInterval().entryTime()).isEqualTo(entry);
    assertThat(ctx.stayInterval().exitTime()).isEqualTo(exit);
    assertThat(ctx.duration()).isEqualTo(Duration.ofMinutes(90));
    assertThat(ctx.entryTime()).isEqualTo(entry);
    assertThat(ctx.exitTime()).isEqualTo(exit);
    assertThat(ctx.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(ctx.breakpoints()).isEmpty();
    assertThat(ctx.settled()).isFalse();
  }

  @Test
  @DisplayName("legacy of() should throw InvalidDomainException when exit time is before entry time")
  void legacyOfShouldThrowWhenExitBeforeEntry() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T12:00:00Z");
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T11:00:00Z");
    RateReference rate = RateReference.builder().build();

    assertThatThrownBy(() -> PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, exit))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessage("Exit time cannot be before entry time");
  }

  @Test
  @DisplayName("legacy of() should throw InvalidDomainException when entry or exit time is null")
  void legacyOfShouldThrowWhenTimesAreNull() {
    RateReference rate = RateReference.builder().build();

    assertThatThrownBy(() -> PricingContext.of(rate, ParkingLotPolicy.defaults(), null, null))
        .isInstanceOf(InvalidDomainException.class)
        .hasMessage("Entry time and exit time cannot be null");
  }

  @Test
  @DisplayName("withSubtotal() should return new instance with accumulated breakpoint")
  void shouldAccumulateSubtotalImmutably() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T11:00:00Z");
    RateReference rate = RateReference.builder().build();

    PricingContext initial = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, exit);
    PricingContext updated = initial.withSubtotal(BigDecimal.valueOf(5000), PriceLine.of("Base Rate", BigDecimal.valueOf(5000)));

    assertThat(initial.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(initial.breakpoints()).isEmpty();

    assertThat(updated.subtotal()).isEqualByComparingTo(BigDecimal.valueOf(5000));
    assertThat(updated.breakpoints()).hasSize(1);
    assertThat(updated.breakpoints().getFirst().concept()).isEqualTo("Base Rate");
  }

  @Test
  @DisplayName("toSettled() should mark settled flag true on new instance")
  void shouldMarkSettled() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T10:10:00Z");
    PricingContext initial = PricingContext.of(RateReference.builder().build(), ParkingLotPolicy.defaults(), entry, exit);

    PricingContext settled = initial.toSettled();

    assertThat(initial.settled()).isFalse();
    assertThat(settled.settled()).isTrue();
  }

  @Test
  @DisplayName("settle() and withSettled() should also mark settled flag on new instance")
  void shouldSupportSettleAliases() {
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = OffsetDateTime.parse("2026-09-07T10:10:00Z");
    PricingContext initial = PricingContext.of(RateReference.builder().build(), ParkingLotPolicy.defaults(), entry, exit);

    PricingContext settledViaSettle = initial.settle();
    PricingContext settledViaWithSettled = initial.withSettled(true);
    PricingContext settledViaParam = initial.settled(true);

    assertThat(settledViaSettle.settled()).isTrue();
    assertThat(settledViaWithSettled.settled()).isTrue();
    assertThat(settledViaParam.settled()).isTrue();
  }
}
