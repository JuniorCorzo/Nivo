package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("StampsStage Tests")
class StampsStageTest {

  private final StampsStage stage = new StampsStage();

  @Test
  @DisplayName("Should return context unmodified for standard pricing context")
  void shouldPassthroughUnsettledContext() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, BigDecimal.ZERO, new BigDecimal("0.19"));
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusHours(2);

    PricingContext ctx = PricingContext.of(RateReference.builder().build(), policy, entry, exit);
    PricingContext result = stage.apply(ctx);

    assertThat(result).isSameAs(ctx);
  }

  @Test
  @DisplayName("Should return context unmodified when context is settled with subtotal and breakpoints")
  void shouldPassthroughSettledContext() {
    ParkingLotPolicy policy = new ParkingLotPolicy(15, BigDecimal.ZERO, new BigDecimal("0.19"));
    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusHours(2);

    PricingContext ctx = PricingContext.of(RateReference.builder().build(), policy, entry, exit)
        .withSubtotal(new BigDecimal("10000.00"), PriceLine.of("Base rate", new BigDecimal("10000.00")))
        .toSettled();

    PricingContext result = stage.apply(ctx);

    assertThat(result).isSameAs(ctx);
  }
}
