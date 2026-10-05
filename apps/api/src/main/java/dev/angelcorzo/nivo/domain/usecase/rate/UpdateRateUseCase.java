package dev.angelcorzo.nivo.domain.usecase.rate;

import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.model.rates.exceptions.RateNotFoundException;
import dev.angelcorzo.nivo.domain.model.rates.gateways.RatesRepository;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.MinChargeDuration;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RatePrice;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class UpdateRateUseCase {
  private final RatesRepository ratesRepository;

  public Rates execute(UpdateRate updateRate) {
    final Rates rate =
        this.ratesRepository
            .findById(updateRate.id())
            .orElseThrow(() -> new RateNotFoundException(updateRate.id()))
            .toBuilder()
            .name(updateRate.name())
            .description(updateRate.description())
            .pricePerUnit(updateRate.pricePerUnit())
            .timeUnit(updateRate.timeUnit())
            .minChargeTimeMinutes(updateRate.minChargeTimeMinutes())
            .vehicleType(updateRate.vehicleType())
            .build();

    return this.ratesRepository.save(rate);
  }

  public record UpdateRate(
      UUID id,
      String name,
      String description,
      BigDecimal pricePerUnit,
      TimeUnitsRate timeUnit,
      int minChargeTimeMinutes,
      VehicleType vehicleType) {

    public UpdateRate {
      RatePrice.of(pricePerUnit);
      MinChargeDuration.of(minChargeTimeMinutes);
    }
  }
}
