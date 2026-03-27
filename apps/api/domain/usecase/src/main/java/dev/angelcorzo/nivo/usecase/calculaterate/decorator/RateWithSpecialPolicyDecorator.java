package dev.angelcorzo.nivo.usecase.calculaterate.decorator;

import dev.angelcorzo.nivo.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.model.specialpolicies.enums.OperationsTypes;
import dev.angelcorzo.nivo.model.specialpolicies.valueobjects.SpecialPoliciesReference;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceLine;
import dev.angelcorzo.nivo.usecase.calculaterate.utils.ParkingFeeCalculator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalUnit;

public class RateWithSpecialPolicyDecorator implements RateComponent {
  private final SpecialPoliciesReference specialPoliciesReference;
  private final RateComponent rateComponent;
  private final BigDecimal total;

  private Duration duration;

  public RateWithSpecialPolicyDecorator(
      RateComponent rateComponent, SpecialPoliciesReference specialPoliciesReference) {
    this.rateComponent = rateComponent;
    this.specialPoliciesReference = specialPoliciesReference;
    this.duration = rateComponent.getDuration();

    this.total = this.applySpecialPolicy();

    this.getItemizedPrices().addLine(PriceLine.of(specialPoliciesReference.name(), this.total));
  }

  @Override
  public RateReference getRates() {
    return this.rateComponent.getRates();
  }

  @Override
  public BigDecimal getPrice() {
    return this.total;
  }

  @Override
  public Duration getDuration() {
    return this.duration;
  }

  @Override
  public TimeUnitsRate getTimeUnit() {
    return this.rateComponent.getTimeUnit();
  }

  @Override
  public PriceDetailed getItemizedPrices() {
    return this.rateComponent.getItemizedPrices();
  }

  private BigDecimal applySpecialPolicy() {
    final BigDecimal currentPrice = this.rateComponent.getPrice();
    final ModifiesTypes modifies = this.specialPoliciesReference.modifies();

    final BigDecimal priceModified =
        modifies == ModifiesTypes.TIME ? this.adjustedDuration() : this.adjustedPrice(currentPrice);

    return priceModified.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : priceModified;
  }

  private BigDecimal adjustedPrice(BigDecimal price) {
    final BigDecimal valueToModify = this.specialPoliciesReference.valueToModify();

    return switch (this.specialPoliciesReference.operation()) {
      case SUBTRACT -> price.subtract(valueToModify);
      case SET -> valueToModify;
      case PERCENTAGE -> adjustPercentage(price, valueToModify);
    };
  }

  private BigDecimal adjustedDuration() {
    final Duration baseDuration = this.rateComponent.getDuration();
    final Duration newDuration = calculatedAdjustedDuration(baseDuration);
    this.duration = newDuration;

    final RateReference rate = this.rateComponent.getRates();
    final Duration minDuration =
        ParkingFeeCalculator.transfomDuration(
            Long.parseLong(rate.minChargeTimeMinutes()), ChronoUnit.MINUTES);

    return ParkingFeeCalculator.calculateFee(
        newDuration,
        this.rateComponent.getPrice(),
        minDuration,
        rate.timeUnit().getChronoUnit(),
        RoundingMode.HALF_UP);
  }

  private Duration calculatedAdjustedDuration(Duration duration) {
    final BigDecimal valueToModify = this.specialPoliciesReference.valueToModify();
    final TemporalUnit timeUnit = this.rateComponent.getTimeUnit().getChronoUnit();
    final Duration timeToModify = Duration.of(valueToModify.longValue(), timeUnit);
    final OperationsTypes operation = this.specialPoliciesReference.operation();

    return switch (operation) {
      case SET -> timeToModify;
      case SUBTRACT -> duration.minus(timeToModify);
      case PERCENTAGE -> {
        final long valueModified =
            adjustPercentage(BigDecimal.valueOf(duration.toMillis()), valueToModify)
                .longValueExact();

        yield Duration.of(valueModified, timeUnit);
      }
    };
  }

  private BigDecimal adjustPercentage(BigDecimal value, BigDecimal percentage) {
    final BigDecimal discount =
        value.multiply(percentage.divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP));

    return value.subtract(discount);
  }
}
