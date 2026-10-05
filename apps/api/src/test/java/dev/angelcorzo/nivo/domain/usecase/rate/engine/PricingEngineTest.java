package dev.angelcorzo.nivo.domain.usecase.rate.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

@DisplayName("PricingEngine Tests")
class PricingEngineTest {

  @Test
  @DisplayName("Should short-circuit remaining stages when settled is true")
  void shouldShortCircuitWhenSettled() {
    PricingStage stage1 = mock(PricingStage.class);
    PricingStage stage2 = mock(PricingStage.class);

    when(stage1.apply(any())).thenAnswer(inv -> {
      PricingContext c = inv.getArgument(0);
      return c.withSubtotal(new BigDecimal("500.00"), PriceLine.of("Grace", new BigDecimal("500.00"))).toSettled();
    });

    PricingEngine engine = new PricingEngine(List.of(stage1, stage2));

    OffsetDateTime now = OffsetDateTime.now();
    PricingContext ctx = PricingContext.of(RateReference.builder().build(), ParkingLotPolicy.defaults(), now.minusMinutes(5), now);

    PriceDetailed detailed = engine.calculate(ctx, "Test Parking");

    verify(stage1, times(1)).apply(any());
    verify(stage2, never()).apply(any());

    assertThat(detailed.getName()).isEqualTo("Test Parking");
    assertThat(detailed.getSubtotal()).isEqualByComparingTo(new BigDecimal("500.00"));
    assertThat(detailed.getTotal()).isEqualByComparingTo(new BigDecimal("595.00")); // 500 + 19% IVA
  }

  @Test
  @DisplayName("Should execute all stages in order when settled is false")
  void shouldExecuteAllStagesInOrder() {
    PricingStage stage1 = mock(PricingStage.class);
    PricingStage stage2 = mock(PricingStage.class);

    when(stage1.apply(any())).thenAnswer(inv -> {
      PricingContext c = inv.getArgument(0);
      return c.withSubtotal(new BigDecimal("5000.00"), PriceLine.of("Base Rate", new BigDecimal("5000.00")));
    });

    when(stage2.apply(any())).thenAnswer(inv -> {
      PricingContext c = inv.getArgument(0);
      return c.withSubtotal(new BigDecimal("6000.00"), PriceLine.of("Surcharge", new BigDecimal("1000.00")));
    });

    PricingEngine engine = new PricingEngine(List.of(stage1, stage2));

    OffsetDateTime now = OffsetDateTime.now();
    PricingContext ctx = PricingContext.of(RateReference.builder().build(), ParkingLotPolicy.defaults(), now.minusHours(1), now);

    PriceDetailed detailed = engine.calculate(ctx, "Central Parking");

    InOrder inOrder = inOrder(stage1, stage2);
    inOrder.verify(stage1).apply(any());
    inOrder.verify(stage2).apply(any());

    assertThat(detailed.getName()).isEqualTo("Central Parking");
    assertThat(detailed.getSubtotal()).isEqualByComparingTo(new BigDecimal("6000.00"));
    assertThat(detailed.getTotal()).isEqualByComparingTo(new BigDecimal("7140.00")); // 6000 + 19% IVA (1140)
    assertThat(detailed.getBreakpoint()).hasSize(2);
  }

  @Test
  @DisplayName("Should defensively copy stages list")
  void shouldDefensivelyCopyStagesList() {
    PricingStage stage1 = mock(PricingStage.class);
    PricingStage stage2 = mock(PricingStage.class);

    when(stage1.apply(any())).thenAnswer(inv -> inv.getArgument(0));
    when(stage2.apply(any())).thenAnswer(inv -> inv.getArgument(0));

    List<PricingStage> mutableList = new ArrayList<>();
    mutableList.add(stage1);

    PricingEngine engine = new PricingEngine(mutableList);

    // Modify original list after construction
    mutableList.add(stage2);

    OffsetDateTime now = OffsetDateTime.now();
    PricingContext ctx = PricingContext.of(RateReference.builder().build(), ParkingLotPolicy.defaults(), now.minusMinutes(10), now);

    engine.calculate(ctx, "Test Parking");

    verify(stage1, times(1)).apply(any());
    verify(stage2, never()).apply(any());
  }

  @Test
  @DisplayName("Should immediately return if initial context is already settled")
  void shouldReturnImmediatelyIfInitialContextSettled() {
    PricingStage stage1 = mock(PricingStage.class);
    PricingEngine engine = new PricingEngine(List.of(stage1));

    OffsetDateTime now = OffsetDateTime.now();
    PricingContext ctx = PricingContext.of(RateReference.builder().build(), ParkingLotPolicy.defaults(), now.minusMinutes(5), now)
        .withSubtotal(new BigDecimal("200.00"), PriceLine.of("Prior", new BigDecimal("200.00")))
        .toSettled();

    PriceDetailed detailed = engine.calculate(ctx, "Already Settled Parking");

    verify(stage1, never()).apply(any());
    assertThat(detailed.getSubtotal()).isEqualByComparingTo(new BigDecimal("200.00"));
  }

  @Test
  @DisplayName("PriceDetailed.from should correctly populate fields from PricingContext")
  void shouldPopulatePriceDetailedFromContext() {
    OffsetDateTime now = OffsetDateTime.now();
    ParkingLotPolicy policy = ParkingLotPolicy.builder()
        .gracePeriodMinutes(15)
        .gracePeriodPrice(BigDecimal.ZERO)
        .ivaRate(new BigDecimal("0.10"))
        .build();

    PricingContext ctx = PricingContext.of(RateReference.builder().build(), policy, now.minusHours(2), now)
        .withSubtotal(new BigDecimal("1000.00"), PriceLine.of("Step 1", new BigDecimal("1000.00")))
        .withSubtotal(new BigDecimal("1500.00"), PriceLine.of("Step 2", new BigDecimal("500.00")));

    PriceDetailed detailed = PriceDetailed.from(ctx, "Custom Tenant");

    assertThat(detailed.getName()).isEqualTo("Custom Tenant");
    assertThat(detailed.getIvaRate()).isEqualByComparingTo(new BigDecimal("0.10"));
    assertThat(detailed.getSubtotal()).isEqualByComparingTo(new BigDecimal("1500.00"));
    assertThat(detailed.getIvaAmount()).isEqualByComparingTo(new BigDecimal("150.00"));
    assertThat(detailed.getTotal()).isEqualByComparingTo(new BigDecimal("1650.00"));
    assertThat(detailed.getBreakpoint()).hasSize(2);
  }
}
