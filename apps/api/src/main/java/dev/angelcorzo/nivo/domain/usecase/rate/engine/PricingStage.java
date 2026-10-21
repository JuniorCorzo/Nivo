package dev.angelcorzo.nivo.domain.usecase.rate.engine;

@FunctionalInterface
public interface PricingStage {
  PricingContext apply(PricingContext context);
}
