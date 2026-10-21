package dev.angelcorzo.nivo.domain.usecase.rate.engine;

import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceDetailed;
import java.util.List;

/**
 * Executes an ordered pipeline of {@link PricingStage} steps to compute parking fees.
 *
 * <p>The sequential stage pipeline acts as the extensible hook for fee calculation and discount
 * policies. Future subscriber plans, commercial validation stamps, or partner loyalty stages
 * can be plugged in as modular {@link PricingStage} implementations without modifying the core
 * execution loop.
 */
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
