package dev.angelcorzo.nivo.domain.model.rates.valueobject;

import dev.angelcorzo.nivo.domain.model.rates.Rates;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.model.specialpolicies.valueobjects.SpecialPoliciesReference;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
public record RateReference(
    UUID id,
    String name,
    String description,
    BigDecimal pricePerUnit,
    TimeUnitsRate timeUnit,
    int minChargeTimeMinutes,
    VehicleType vehicleType,
    SpecialPoliciesReference specialPolicy) {

  public static RateReference of(Rates rate) {
    return RateReference.builder()
        .id(rate.getId())
        .name(rate.getName())
        .description(rate.getDescription())
        .pricePerUnit(rate.getPricePerUnit())
        .timeUnit(rate.getTimeUnit())
        .minChargeTimeMinutes(rate.getMinChargeTimeMinutes())
        .vehicleType(rate.getVehicleType())
        .specialPolicy(rate.getSpecialPolicy())
        .build();
  }

  public boolean hasSpecialPolicy() {
    return this.specialPolicy != null;
  }
}
