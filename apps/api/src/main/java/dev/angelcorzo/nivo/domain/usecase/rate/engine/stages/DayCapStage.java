package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingStage;

/**
 * Stub stage for Maximum Daily Cap.
 * TODO: ANC-XX Enforce day cap safeguard against total stay cost.
 */
public class DayCapStage implements PricingStage {
  @Override
  public PricingContext apply(PricingContext context) {
    return context;
  }
}
