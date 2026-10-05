package dev.angelcorzo.nivo.domain.usecase.rate.engine;

import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import java.util.List;

public class PricingEngine {
  private final List<PricingStage> stages;

  public PricingEngine(List<PricingStage> stages) {
    this.stages = List.copyOf(stages);
  }

  public PriceDetailed calculate(PricingContext context, String tenantName) {
    PricingContext current = context;
    for (PricingStage stage : this.stages) {
      if (current.settled()) {
        break;
      }
      current = stage.apply(current);
      if (current.settled()) {
        break;
      }
    }
    return PriceDetailed.from(current, tenantName);
  }
}
