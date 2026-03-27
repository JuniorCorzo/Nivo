package dev.angelcorzo.nivo.usecase.calculaterate.decorator;

import dev.angelcorzo.nivo.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceLine;
import dev.angelcorzo.nivo.usecase.calculaterate.utils.ParkingFeeCalculator;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalUnit;

public class RateBaseDecorator implements RateComponent {
  private final BigDecimal total;
  private final TimeUnitsRate timeUnit;
  private final Duration duration;
  private final RateReference rate;
  private final PriceDetailed itemizedPrices;

  public RateBaseDecorator(
      String tenantName, BigDecimal ivaRate, RateReference rate, OffsetDateTime entryTime) {
    this.itemizedPrices = PriceDetailed.of(tenantName);
    this.timeUnit = rate.timeUnit();
    this.rate = rate;
    this.duration = Duration.between(entryTime, OffsetDateTime.now());
    this.total =
        ParkingFeeCalculator.calculateFee(
            duration,
            rate.pricePerUnit(),
            Duration.of(Long.parseLong(rate.minChargeTimeMinutes()), ChronoUnit.MINUTES),
            timeUnit.getChronoUnit(),
            RoundingMode.HALF_UP);

    final String concept = this.generateConcept();
    this.itemizedPrices.addLine(PriceLine.of(concept, this.total));
    this.itemizedPrices.setIvaRate(ivaRate);
  }

  @Override
  public RateReference getRates() {
    return this.rate;
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
    return this.timeUnit;
  }

  @Override
  public PriceDetailed getItemizedPrices() {
    return this.itemizedPrices;
  }

  private String generateConcept() {
    return String.format(
        "%s (%s * %d COP/%s)",
        this.rate.name(),
        this.timeUnit.getDurationTime(this.duration),
        this.rate.pricePerUnit().intValue(),
        this.timeUnit.getName());
  }
}
