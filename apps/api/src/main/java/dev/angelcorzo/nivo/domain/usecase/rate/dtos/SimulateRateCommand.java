package dev.angelcorzo.nivo.domain.usecase.rate.dtos;

import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import java.math.BigDecimal;

public record SimulateRateCommand(
  VehicleType vehicleType,
  long minutesStayed,
  BigDecimal pricePerUnit,
  TimeUnitsRate timeUnit,
  Integer gracePeriodMinutes,
  BigDecimal ivaRate) {
  public static SimulateRateCommand of(
    VehicleType vehicleType,
    long minutesStayed,
    BigDecimal pricePerUnit,
    TimeUnitsRate timeUnit,
    Integer gracePeriodMinutes,
    BigDecimal ivaRate) {
    final VehicleType resolvedVehicleType = vehicleType != null ? vehicleType : VehicleType.CAR;
    final BigDecimal defaultPrice = resolvedVehicleType == VehicleType.MOTORCYCLE
      ? new BigDecimal("2000.00")
      : new BigDecimal("4000.00");

    return new SimulateRateCommand(
      resolvedVehicleType,
      Math.max(0, minutesStayed),
      pricePerUnit != null ? pricePerUnit : defaultPrice,
      timeUnit != null ? timeUnit : TimeUnitsRate.HOURS,
      gracePeriodMinutes != null ? gracePeriodMinutes : 15,
      ivaRate != null ? ivaRate : new BigDecimal("0.19"));
  }
}
