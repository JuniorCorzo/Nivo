package dev.angelcorzo.nivo.domain.usecase.rate;

import dev.angelcorzo.nivo.domain.model.commons.valueobjects.TaxRate;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.parkinglots.valueobject.GracePeriod;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.SimulateRateCommand;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingEngine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.StayInterval;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class SimulateRateUseCase {

  private final PricingEngine pricingEngine;
  private final Clock clock;

  public PriceDetailed execute(final SimulateRateCommand command) {
    final SimulateRateCommand sanitized =
        SimulateRateCommand.of(
            command != null ? command.vehicleType() : null,
            command != null ? command.minutesStayed() : 0L,
            command != null ? command.pricePerUnit() : null,
            command != null ? command.timeUnit() : null,
            command != null ? command.gracePeriodMinutes() : null,
            command != null ? command.ivaRate() : null);

    final RateReference rate =
        RateReference.builder()
            .id(UUID.randomUUID())
            .name(String.format("Tarifa %s", sanitized.vehicleType().name()))
            .description("Tarifa simulada")
            .pricePerUnit(sanitized.pricePerUnit())
            .timeUnit(sanitized.timeUnit())
            .minChargeTimeMinutes(sanitized.timeUnit() == TimeUnitsRate.MINUTES ? 1 : 60)
            .vehicleType(sanitized.vehicleType())
            .build();

    final ParkingLotPolicy policy =
        new ParkingLotPolicy(
            GracePeriod.of(sanitized.gracePeriodMinutes(), BigDecimal.ZERO),
            TaxRate.of(sanitized.ivaRate()));

    final OffsetDateTime now = OffsetDateTime.now(this.clock);
    final OffsetDateTime entryTime = now.minusMinutes(sanitized.minutesStayed());
    final StayInterval stayInterval = StayInterval.of(entryTime, now);

    final PricingContext context = PricingContext.of(rate, policy, stayInterval);

    return this.pricingEngine.calculate(context, "Simulador Nivo");
  }
}
