package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.model.specialpolicies.valueobjects.SpecialPoliciesReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingStage;
import dev.angelcorzo.nivo.domain.usecase.rate.utils.ParkingFeeCalculator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalUnit;

public class SpecialPolicyStage implements PricingStage {

  @Override
  public PricingContext apply(PricingContext context) {
    if (context.settled() || context.rate() == null || !context.rate().hasSpecialPolicy()) {
      return context;
    }

    SpecialPoliciesReference policy = context.rate().specialPolicy();
    if (policy == null || !policy.active()) {
      return context;
    }

    return switch (policy.modifies()) {
      case TIME -> applyTimeModification(context, policy);
      case SURCHARGE -> applySurcharge(context, policy);
      case PRICE, DISCOUNT -> applyDiscountOrPrice(context, policy);
    };
  }

  private PricingContext applyTimeModification(PricingContext context, SpecialPoliciesReference policy) {
    Duration adjustedDuration = calculateAdjustedDuration(context, policy);
    RateReference rate = context.rate();
    Duration minDuration = Duration.of(rate.minChargeTimeMinutes(), ChronoUnit.MINUTES);

    BigDecimal newFee = ParkingFeeCalculator.calculateFee(
        adjustedDuration,
        rate.pricePerUnit(), // FIX: use rate.pricePerUnit(), NOT accumulated subtotal
        minDuration,
        rate.timeUnit().getChronoUnit(),
        RoundingMode.HALF_UP
    );

    BigDecimal delta = newFee.subtract(context.subtotal());
    return context.withSubtotal(newFee, PriceLine.of(policy.name(), delta));
  }

  private PricingContext applySurcharge(PricingContext context, SpecialPoliciesReference policy) {
    BigDecimal current = context.subtotal();
    BigDecimal surchargeAmount = switch (policy.operation()) {
      case SET -> policy.valueToModify();
      case SUBTRACT -> policy.valueToModify();
      case PERCENTAGE -> current.multiply(policy.valueToModify().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
    };

    BigDecimal newSubtotal = current.add(surchargeAmount);
    return context.withSubtotal(newSubtotal, PriceLine.of(policy.name(), surchargeAmount));
  }

  private PricingContext applyDiscountOrPrice(PricingContext context, SpecialPoliciesReference policy) {
    BigDecimal current = context.subtotal();
    BigDecimal newSubtotal = switch (policy.operation()) {
      case SET -> policy.valueToModify();
      case SUBTRACT -> current.subtract(policy.valueToModify());
      case PERCENTAGE -> {
        BigDecimal discount = current.multiply(policy.valueToModify().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        yield current.subtract(discount);
      }
    };

    if (newSubtotal.compareTo(BigDecimal.ZERO) < 0) {
      newSubtotal = BigDecimal.ZERO;
    }

    BigDecimal delta = newSubtotal.subtract(current);
    return context.withSubtotal(newSubtotal, PriceLine.of(policy.name(), delta));
  }

  private Duration calculateAdjustedDuration(PricingContext context, SpecialPoliciesReference policy) {
    Duration current = context.duration();
    TemporalUnit unit = context.rate().timeUnit().getChronoUnit();
    Duration modDuration = Duration.of(policy.valueToModify().longValue(), unit);

    return switch (policy.operation()) {
      case SET -> modDuration;
      case SUBTRACT -> {
        Duration subtracted = current.minus(modDuration);
        yield subtracted.isNegative() ? Duration.ZERO : subtracted;
      }
      case PERCENTAGE -> {
        BigDecimal factor = BigDecimal.ONE.subtract(policy.valueToModify().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        long newMillis = BigDecimal.valueOf(current.toMillis()).multiply(factor).longValue();
        yield Duration.ofMillis(Math.max(0, newMillis));
      }
    };
  }
}
