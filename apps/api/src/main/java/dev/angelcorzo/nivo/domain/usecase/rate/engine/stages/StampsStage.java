package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingStage;

/**
 * Stub stage for Commercial Validation Stamps (Cinema, Supermarket).
 * TODO: ANC-XX Integrate commercial stamp deductions when merchant module is ready.
 */
public class StampsStage implements PricingStage {
  @Override
  public PricingContext apply(PricingContext context) {
    return context;
  }
}
