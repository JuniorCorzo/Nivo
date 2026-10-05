package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingStage;

public class GracePeriodStage implements PricingStage {

  @Override
  public PricingContext apply(PricingContext context) {
    if (context.settled()) {
      return context;
    }

    ParkingLotPolicy policy = context.policy();
    if (policy == null || policy.gracePeriod() == null || !policy.gracePeriod().covers(context.duration())) {
      return context;
    }

    if (policy.gracePeriod().isFree()) {
      return context.toSettled();
    }

    PriceLine line = PriceLine.of("Grace period", policy.gracePeriod().price());
    return context.withSubtotal(policy.gracePeriod().price(), line).toSettled();
  }
}
