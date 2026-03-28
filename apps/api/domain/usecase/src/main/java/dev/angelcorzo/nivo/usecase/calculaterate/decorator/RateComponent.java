package dev.angelcorzo.nivo.usecase.calculaterate.decorator;

import dev.angelcorzo.nivo.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.model.rates.valueobject.RateReference;
import dev.angelcorzo.nivo.usecase.calculaterate.dtos.PriceDetailed;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.temporal.TemporalUnit;
import java.util.LinkedList;

public interface RateComponent {
  RateReference getRates();

  BigDecimal getPrice();

  Duration getDuration();

  TimeUnitsRate getTimeUnit();

  PriceDetailed getItemizedPrices();
}
