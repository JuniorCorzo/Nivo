package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("GracePeriodStage Tests")
class GracePeriodStageTest {

  private final GracePeriodStage stage = new GracePeriodStage();

  @Test
  @DisplayName("Should passthrough when parking has no grace period configured")
  void shouldPassthroughWhenNoGrace() {
    ParkingLotPolicy policy = new ParkingLotPolicy(0, BigDecimal.ZERO, new BigDecimal("0.19"));
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusMinutes(5);

    PricingContext ctx = PricingContext.of(RateReference.builder().build(), policy, entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.settled()).isFalse();
    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.breakpoints()).isEmpty();
  }

  @Test
  @DisplayName("Should settle with zero subtotal when stay is within free grace window")
  void shouldSettleFreeGrace() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, BigDecimal.ZERO, new BigDecimal("0.19"));
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusMinutes(10);

    PricingContext ctx = PricingContext.of(RateReference.builder().build(), policy, entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.settled()).isTrue();
    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.breakpoints()).isEmpty();
  }

  @Test
  @DisplayName("Should settle with flat fee when stay is within priced grace window")
  void shouldSettlePricedGrace() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, new BigDecimal("500.00"), new BigDecimal("0.19"));
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusMinutes(10);

    PricingContext ctx = PricingContext.of(RateReference.builder().build(), policy, entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.settled()).isTrue();
    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("500.00"));
    assertThat(result.breakpoints()).hasSize(1);
    assertThat(result.breakpoints().getFirst().concept()).contains("Grace period");
    assertThat(result.breakpoints().getFirst().amount()).isEqualByComparingTo(new BigDecimal("500.00"));
  }

  @Test
  @DisplayName("Should passthrough when stay exceeds grace period window")
  void shouldPassthroughWhenStayExceedsGrace() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, new BigDecimal("500.00"), new BigDecimal("0.19"));
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusMinutes(20);

    PricingContext ctx = PricingContext.of(RateReference.builder().build(), policy, entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.settled()).isFalse();
    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.breakpoints()).isEmpty();
  }

  @Test
  @DisplayName("Should passthrough when context is already settled")
  void shouldPassthroughWhenAlreadySettled() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, BigDecimal.ZERO, new BigDecimal("0.19"));
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusMinutes(5);

    PricingContext ctx = PricingContext.of(RateReference.builder().build(), policy, entry, exit).toSettled();
    PricingContext result = stage.apply(ctx);

    assertThat(result.settled()).isTrue();
  }

  @Test
  @DisplayName("Should settle when stay is exactly at grace period window limit")
  void shouldSettleAtExactGraceLimit() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, BigDecimal.ZERO, new BigDecimal("0.19"));
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusMinutes(15);

    PricingContext ctx = PricingContext.of(RateReference.builder().build(), policy, entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result.settled()).isTrue();
    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
  }
}
