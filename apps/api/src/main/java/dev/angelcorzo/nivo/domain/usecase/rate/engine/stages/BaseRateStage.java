package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingStage;
import dev.angelcorzo.nivo.domain.usecase.rate.utils.ParkingFeeCalculator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.temporal.ChronoUnit;

public class BaseRateStage implements PricingStage {

  @Override
  public PricingContext apply(PricingContext context) {
    if (context.settled()) {
      return context;
    }

    RateReference rate = context.rate();
    TimeUnitsRate timeUnit = rate.timeUnit();
    Duration minDuration = Duration.of(rate.minChargeTimeMinutes(), ChronoUnit.MINUTES);

    BigDecimal fee = ParkingFeeCalculator.calculateFee(
        context.duration(),
        rate.pricePerUnit(),
        minDuration,
        timeUnit.getChronoUnit(),
        RoundingMode.HALF_UP
    );

    String concept = String.format(
        "%s (%s * %d COP/%s)",
        rate.name(),
        timeUnit.getDurationTime(context.duration()),
        rate.pricePerUnit().intValue(),
        timeUnit.getName()
    );

    return context.withSubtotal(fee, PriceLine.of(concept, fee));
  }
}
