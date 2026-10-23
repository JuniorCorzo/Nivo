package dev.angelcorzo.nivo.domain.usecase.rate.dtos;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.Builder;

import dev.angelcorzo.nivo.domain.model.commons.valueobjects.TaxRate;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;
import dev.angelcorzo.nivo.domain.model.parkinglots.valueobject.GracePeriod;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.model.rates.valueobject.RateReference;

@Builder
public record SimulateRateCommand(
  VehicleType vehicleType,
  long minutesStayed,
  BigDecimal pricePerUnit,
  TimeUnitsRate timeUnit,
  Integer gracePeriodMinutes,
  BigDecimal ivaRate) {

  public SimulateRateCommand {
    vehicleType = vehicleType != null ? vehicleType : VehicleType.CAR;
    minutesStayed = Math.max(0, minutesStayed);
    if (pricePerUnit == null) {
      pricePerUnit = vehicleType == VehicleType.MOTORCYCLE
        ? new BigDecimal("2000.00")
        : new BigDecimal("4000.00");
    }
    timeUnit = timeUnit != null ? timeUnit : TimeUnitsRate.HOURS;
    gracePeriodMinutes = gracePeriodMinutes != null ? gracePeriodMinutes : 15;
    ivaRate = ivaRate != null ? ivaRate : new BigDecimal("0.19");
  }

  public static SimulateRateCommand of(
    VehicleType vehicleType,
    long minutesStayed,
    BigDecimal pricePerUnit,
    TimeUnitsRate timeUnit,
    Integer gracePeriodMinutes,
    BigDecimal ivaRate) {
    return new SimulateRateCommand(
      vehicleType,
      minutesStayed,
      pricePerUnit,
      timeUnit,
      gracePeriodMinutes,
      ivaRate);
  }

  public RateReference toRateReference() {
    return RateReference.builder()
      .id(UUID.randomUUID())
      .name(String.format("Tarifa %s", this.vehicleType.name()))
      .description("Tarifa simulada")
      .pricePerUnit(this.pricePerUnit)
      .timeUnit(this.timeUnit)
      .minChargeTimeMinutes(this.timeUnit == TimeUnitsRate.MINUTES ? 1 : 60)
      .vehicleType(this.vehicleType)
      .build();
  }

  public ParkingLotPolicy toParkingLotPolicy() {
    return new ParkingLotPolicy(
      GracePeriod.of(this.gracePeriodMinutes, BigDecimal.ZERO),
      TaxRate.of(this.ivaRate));
  }
}
