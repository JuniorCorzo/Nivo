package dev.angelcorzo.nivo.domain.usecase.rate;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.SimulateRateCommand;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingEngine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.StayInterval;
import java.time.Clock;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class SimulateRateUseCase {

  private final PricingEngine pricingEngine;
  private final Clock clock;

  public PriceDetailed execute(final SimulateRateCommand command) {
    final SimulateRateCommand sanitized = command != null
      ? command
      : SimulateRateCommand.of(null, 0L, null, null, null, null);

    final RateReference rate = sanitized.toRateReference();
    final ParkingLotPolicy policy = sanitized.toParkingLotPolicy();

    final OffsetDateTime now = OffsetDateTime.now(this.clock);
    final OffsetDateTime entryTime = now.minusMinutes(sanitized.minutesStayed());
    final StayInterval stayInterval = StayInterval.of(entryTime, now);

    final PricingContext context = PricingContext.of(rate, policy, stayInterval);

    return this.pricingEngine.calculate(context, "Simulador Nivo");
  }
}
