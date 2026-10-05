package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingStage;

/**
 * Stub stage for Monthly Subscriber Contracts.
 * TODO: ANC-XX Integrate SubscriberContract checking when subscriber domain is ready.
 */
public class SubscriberStage implements PricingStage {
  @Override
  public PricingContext apply(PricingContext context) {
    return context;
  }
}
