package dev.angelcorzo.nivo.domain.usecase.rate.engine.stages;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.OperationsTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.valueobjects.SpecialPoliciesReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.PriceLine;
import dev.angelcorzo.nivo.domain.usecase.rate.engine.PricingContext;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("SpecialPolicyStage Tests")
class SpecialPolicyStageTest {

  private final SpecialPolicyStage stage = new SpecialPolicyStage();

  private PricingContext buildContext(BigDecimal subtotal, SpecialPoliciesReference policy) {
    RateReference rate = RateReference.builder()
        .name("Rate")
        .pricePerUnit(BigDecimal.valueOf(5000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(0)
        .specialPolicy(policy)
        .build();

    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    OffsetDateTime exit = entry.plusHours(4); // 4 hours
    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, exit);
    return ctx.withSubtotal(subtotal, PriceLine.of("Base", subtotal));
  }

  @Test
  @DisplayName("PRICE SUBTRACT should discount subtotal with floor at zero and record delta")
  void shouldSubtractPriceWithFloor() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("Big Discount")
        .modifies(ModifiesTypes.PRICE)
        .operation(OperationsTypes.SUBTRACT)
        .valueToModify(BigDecimal.valueOf(25000))
        .active(true)
        .build();

    PricingContext ctx = buildContext(BigDecimal.valueOf(20000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    assertThat(result.breakpoints()).hasSize(2);
    // Delta should be -20000
    PriceLine discountLine = result.breakpoints().get(1);
    assertThat(discountLine.concept()).isEqualTo("Big Discount");
    assertThat(discountLine.amount()).isEqualByComparingTo(BigDecimal.valueOf(-20000));
  }

  @Test
  @DisplayName("PRICE SUBTRACT should discount subtotal normally when under current amount")
  void shouldSubtractPriceNormally() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("5K Discount")
        .modifies(ModifiesTypes.PRICE)
        .operation(OperationsTypes.SUBTRACT)
        .valueToModify(BigDecimal.valueOf(5000))
        .active(true)
        .build();

    PricingContext ctx = buildContext(BigDecimal.valueOf(20000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("15000.00"));
    assertThat(result.breakpoints()).hasSize(2);
    PriceLine discountLine = result.breakpoints().get(1);
    assertThat(discountLine.concept()).isEqualTo("5K Discount");
    assertThat(discountLine.amount()).isEqualByComparingTo(new BigDecimal("-5000.00"));
  }

  @Test
  @DisplayName("PRICE SET should set subtotal and record net negative delta")
  void shouldSetPrice() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("Fixed Rate")
        .modifies(ModifiesTypes.PRICE)
        .operation(OperationsTypes.SET)
        .valueToModify(BigDecimal.valueOf(2000))
        .active(true)
        .build();

    PricingContext ctx = buildContext(BigDecimal.valueOf(8000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("2000.00"));
    PriceLine discountLine = result.breakpoints().get(1);
    assertThat(discountLine.concept()).isEqualTo("Fixed Rate");
    assertThat(discountLine.amount()).isEqualByComparingTo(new BigDecimal("-6000.00"));
  }

  @Test
  @DisplayName("PRICE PERCENTAGE should discount subtotal by percentage and record negative delta")
  void shouldApplyPricePercentageDiscount() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("20% Off")
        .modifies(ModifiesTypes.PRICE)
        .operation(OperationsTypes.PERCENTAGE)
        .valueToModify(BigDecimal.valueOf(20))
        .active(true)
        .build();

    PricingContext ctx = buildContext(BigDecimal.valueOf(10000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("8000.00"));
    PriceLine discountLine = result.breakpoints().get(1);
    assertThat(discountLine.concept()).isEqualTo("20% Off");
    assertThat(discountLine.amount()).isEqualByComparingTo(new BigDecimal("-2000.00"));
  }

  @Test
  @DisplayName("DISCOUNT PERCENTAGE should calculate discount identically to PRICE")
  void shouldApplyDiscountType() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("15% Promo")
        .modifies(ModifiesTypes.DISCOUNT)
        .operation(OperationsTypes.PERCENTAGE)
        .valueToModify(BigDecimal.valueOf(15))
        .active(true)
        .build();

    PricingContext ctx = buildContext(BigDecimal.valueOf(10000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("8500.00"));
    PriceLine discountLine = result.breakpoints().get(1);
    assertThat(discountLine.concept()).isEqualTo("15% Promo");
    assertThat(discountLine.amount()).isEqualByComparingTo(new BigDecimal("-1500.00"));
  }

  @Test
  @DisplayName("SURCHARGE PERCENTAGE should add surcharge amount and record positive delta")
  void shouldApplySurchargePercentage() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("Night Surcharge")
        .modifies(ModifiesTypes.SURCHARGE)
        .operation(OperationsTypes.PERCENTAGE)
        .valueToModify(BigDecimal.valueOf(20)) // +20%
        .active(true)
        .build();

    PricingContext ctx = buildContext(BigDecimal.valueOf(10000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("12000.00"));
    PriceLine surchargeLine = result.breakpoints().get(1);
    assertThat(surchargeLine.concept()).isEqualTo("Night Surcharge");
    assertThat(surchargeLine.amount()).isEqualByComparingTo(new BigDecimal("2000.00"));
  }

  @Test
  @DisplayName("SURCHARGE SET should add fixed surcharge fee and record positive delta")
  void shouldApplySurchargeSet() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("Cleaning Surcharge")
        .modifies(ModifiesTypes.SURCHARGE)
        .operation(OperationsTypes.SET)
        .valueToModify(BigDecimal.valueOf(3000))
        .active(true)
        .build();

    PricingContext ctx = buildContext(BigDecimal.valueOf(10000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("13000.00"));
    PriceLine surchargeLine = result.breakpoints().get(1);
    assertThat(surchargeLine.concept()).isEqualTo("Cleaning Surcharge");
    assertThat(surchargeLine.amount()).isEqualByComparingTo(new BigDecimal("3000.00"));
  }

  @Test
  @DisplayName("TIME SUBTRACT bug fix: must recalculate using rate.pricePerUnit, not accumulated subtotal")
  void shouldRecalculateDurationUsingPricePerUnit() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("1 Hour Free")
        .modifies(ModifiesTypes.TIME)
        .operation(OperationsTypes.SUBTRACT)
        .valueToModify(BigDecimal.valueOf(1)) // minus 1 hour
        .active(true)
        .build();

    // 4 hours stayed = 20000 base. 4h - 1h = 3h. 3h * 5000 (pricePerUnit) = 15000 (NOT 3 * 20000 = 60000!)
    PricingContext ctx = buildContext(BigDecimal.valueOf(20000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("15000.00"));
    PriceLine timeLine = result.breakpoints().get(1);
    assertThat(timeLine.concept()).isEqualTo("1 Hour Free");
    assertThat(timeLine.amount()).isEqualByComparingTo(new BigDecimal("-5000.00"));
  }

  @Test
  @DisplayName("TIME SET should set duration and recalculate fee using pricePerUnit")
  void shouldSetDurationTime() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("Flat 2 Hours")
        .modifies(ModifiesTypes.TIME)
        .operation(OperationsTypes.SET)
        .valueToModify(BigDecimal.valueOf(2)) // set to 2 hours
        .active(true)
        .build();

    // 4 hours stayed = 20000 base. Set to 2h -> 2h * 5000 = 10000. Delta = -10000.
    PricingContext ctx = buildContext(BigDecimal.valueOf(20000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("10000.00"));
    PriceLine timeLine = result.breakpoints().get(1);
    assertThat(timeLine.concept()).isEqualTo("Flat 2 Hours");
    assertThat(timeLine.amount()).isEqualByComparingTo(new BigDecimal("-10000.00"));
  }

  @Test
  @DisplayName("TIME PERCENTAGE should reduce duration by percentage and recalculate fee")
  void shouldApplyPercentageTimeModification() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("Half Duration")
        .modifies(ModifiesTypes.TIME)
        .operation(OperationsTypes.PERCENTAGE)
        .valueToModify(BigDecimal.valueOf(50)) // 50% discount on time
        .active(true)
        .build();

    // 4 hours stayed = 20000 base. 50% reduction -> 2h * 5000 = 10000. Delta = -10000.
    PricingContext ctx = buildContext(BigDecimal.valueOf(20000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(new BigDecimal("10000.00"));
    PriceLine timeLine = result.breakpoints().get(1);
    assertThat(timeLine.concept()).isEqualTo("Half Duration");
    assertThat(timeLine.amount()).isEqualByComparingTo(new BigDecimal("-10000.00"));
  }

  @Test
  @DisplayName("TIME SUBTRACT should floor duration at zero when subtraction exceeds actual duration")
  void shouldHandleTimeSubtractExceedingDuration() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("5 Hours Free")
        .modifies(ModifiesTypes.TIME)
        .operation(OperationsTypes.SUBTRACT)
        .valueToModify(BigDecimal.valueOf(5)) // minus 5 hours on 4h stay
        .active(true)
        .build();

    PricingContext ctx = buildContext(BigDecimal.valueOf(20000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.ZERO);
    PriceLine timeLine = result.breakpoints().get(1);
    assertThat(timeLine.concept()).isEqualTo("5 Hours Free");
    assertThat(timeLine.amount()).isEqualByComparingTo(new BigDecimal("-20000.00"));
  }

  @Test
  @DisplayName("Should skip when context is already settled")
  void shouldSkipWhenSettled() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("1 Hour Free")
        .modifies(ModifiesTypes.TIME)
        .operation(OperationsTypes.SUBTRACT)
        .valueToModify(BigDecimal.valueOf(1))
        .active(true)
        .build();

    PricingContext ctx = buildContext(BigDecimal.valueOf(20000), policy).toSettled();
    PricingContext result = stage.apply(ctx);

    assertThat(result).isSameAs(ctx);
    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.valueOf(20000));
    assertThat(result.breakpoints()).hasSize(1);
  }

  @Test
  @DisplayName("Should skip when rate has no special policy")
  void shouldSkipWhenNoSpecialPolicy() {
    RateReference rate = RateReference.builder()
        .name("Rate")
        .pricePerUnit(BigDecimal.valueOf(5000))
        .timeUnit(TimeUnitsRate.HOURS)
        .minChargeTimeMinutes(0)
        .specialPolicy(null)
        .build();

    OffsetDateTime entry = OffsetDateTime.parse("2026-09-07T10:00:00Z");
    PricingContext ctx = PricingContext.of(rate, ParkingLotPolicy.defaults(), entry, entry.plusHours(4))
        .withSubtotal(BigDecimal.valueOf(20000), PriceLine.of("Base", BigDecimal.valueOf(20000)));

    PricingContext result = stage.apply(ctx);

    assertThat(result).isSameAs(ctx);
    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.valueOf(20000));
    assertThat(result.breakpoints()).hasSize(1);
  }

  @Test
  @DisplayName("Should skip when special policy is inactive")
  void shouldSkipWhenSpecialPolicyInactive() {
    SpecialPoliciesReference policy = SpecialPoliciesReference.builder()
        .name("Inactive Discount")
        .modifies(ModifiesTypes.PRICE)
        .operation(OperationsTypes.SUBTRACT)
        .valueToModify(BigDecimal.valueOf(5000))
        .active(false)
        .build();

    PricingContext ctx = buildContext(BigDecimal.valueOf(20000), policy);
    PricingContext result = stage.apply(ctx);

    assertThat(result).isSameAs(ctx);
    assertThat(result.subtotal()).isEqualByComparingTo(BigDecimal.valueOf(20000));
    assertThat(result.breakpoints()).hasSize(1);
  }
}
