package dev.angelcorzo.nivo.domain.usecase.rate;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.SimulateRateCommand;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingEngine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.BaseRateStage;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.DayCapStage;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.GracePeriodStage;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.stages.SpecialPolicyStage;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("SimulateRateUseCase Tests")
class SimulateRateUseCaseTest {

  private SimulateRateUseCase useCase;
  private Clock fixedClock;

  @BeforeEach
  void setUp() {
    this.fixedClock = Clock.fixed(Instant.parse("2026-10-21T12:00:00Z"), ZoneId.of("UTC"));
    final PricingEngine engine = new PricingEngine(
      List.of(
        new GracePeriodStage(),
        new BaseRateStage(),
        new SpecialPolicyStage(),
        new DayCapStage()));
    this.useCase = new SimulateRateUseCase(engine, this.fixedClock);
  }

  @Test
  @DisplayName("Should return 0 total and subtotal when stay duration is within grace period")
  void shouldReturnZeroWhenWithinGracePeriod() {
    final SimulateRateCommand command = new SimulateRateCommand(
      VehicleType.CAR,
      10L,
      new BigDecimal("4000.00"),
      TimeUnitsRate.HOURS,
      15,
      new BigDecimal("0.19"));

    final PriceDetailed result = this.useCase.execute(command);

    assertThat(result).isNotNull();
    assertThat(result.getSubtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.getTotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.getIvaAmount()).isEqualByComparingTo(BigDecimal.ZERO);
  }

  @Test
  @DisplayName("Should calculate fee and IVA correctly when stay duration exceeds grace period")
  void shouldCalculateFeeWhenExceedsGracePeriod() {
    final SimulateRateCommand command = new SimulateRateCommand(
      VehicleType.CAR,
      90L,
      new BigDecimal("4000.00"),
      TimeUnitsRate.HOURS,
      15,
      new BigDecimal("0.19"));

    final PriceDetailed result = this.useCase.execute(command);

    assertThat(result).isNotNull();
    assertThat(result.getSubtotal()).isGreaterThan(BigDecimal.ZERO);
    assertThat(result.getIvaAmount()).isGreaterThan(BigDecimal.ZERO);
    assertThat(result.getTotal()).isEqualTo(result.getSubtotal().add(result.getIvaAmount()));
    assertThat(result.getBreakpoint()).isNotEmpty();
  }

  @Test
  @DisplayName("Should use defaults when optional parameters are null")
  void shouldUseDefaultsWhenParametersAreNull() {
    final SimulateRateCommand command = new SimulateRateCommand(null, 60L, null, null, null, null);

    final PriceDetailed result = this.useCase.execute(command);

    assertThat(result).isNotNull();
    assertThat(result.getSubtotal()).isEqualByComparingTo(new BigDecimal("4000.00"));
    assertThat(result.getIvaRate()).isEqualByComparingTo(new BigDecimal("0.19"));
    assertThat(result.getIvaAmount()).isEqualByComparingTo(new BigDecimal("760.00"));
    assertThat(result.getTotal()).isEqualByComparingTo(new BigDecimal("4760.00"));
  }
}
