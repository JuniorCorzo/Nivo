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
import dev.angelcorzo.nivo.domain.model.specialpolicies.valueobjects.SpecialPoliciesReference;

@Builder
public record SimulateRateCommand(
  VehicleType vehicleType,
  long minutesStayed,
  BigDecimal pricePerUnit,
  TimeUnitsRate timeUnit,
  Integer gracePeriodMinutes,
  BigDecimal ivaRate,
  Integer minChargeTimeMinutes,
  BigDecimal gracePeriodPrice,
  SpecialPoliciesReference specialPolicy,
  String rateName) {

  public static final long MAX_MINUTES_STAYED = 525_600L;

  public SimulateRateCommand {
    vehicleType = vehicleType != null ? vehicleType : VehicleType.CAR;
    minutesStayed = Math.min(MAX_MINUTES_STAYED, Math.max(0, minutesStayed));
    if (pricePerUnit == null) {
      pricePerUnit = vehicleType == VehicleType.MOTORCYCLE
        ? new BigDecimal("2000.00")
        : new BigDecimal("4000.00");
    }
    timeUnit = timeUnit != null ? timeUnit : TimeUnitsRate.HOURS;
    gracePeriodMinutes = gracePeriodMinutes != null ? gracePeriodMinutes : 15;
    ivaRate = ivaRate != null ? ivaRate : new BigDecimal("0.19");
    gracePeriodPrice = gracePeriodPrice != null ? gracePeriodPrice : BigDecimal.ZERO;
  }

  public SimulateRateCommand(
    VehicleType vehicleType,
    long minutesStayed,
    BigDecimal pricePerUnit,
    TimeUnitsRate timeUnit,
    Integer gracePeriodMinutes,
    BigDecimal ivaRate) {
    this(
      vehicleType,
      minutesStayed,
      pricePerUnit,
      timeUnit,
      gracePeriodMinutes,
      ivaRate,
      null,
      null,
      null,
      null);
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
    final int effectiveMinCharge = this.minChargeTimeMinutes != null
      ? this.minChargeTimeMinutes
      : (this.timeUnit == TimeUnitsRate.MINUTES ? 1 : 60);
    final String effectiveName = this.rateName != null && !this.rateName.isBlank()
      ? this.rateName
      : String.format("Tarifa %s", this.vehicleType.name());

    return RateReference.builder()
      .id(UUID.randomUUID())
      .name(effectiveName)
      .description("Tarifa simulada")
      .pricePerUnit(this.pricePerUnit)
      .timeUnit(this.timeUnit)
      .minChargeTimeMinutes(effectiveMinCharge)
      .vehicleType(this.vehicleType)
      .specialPolicy(this.specialPolicy)
      .build();
  }

  public ParkingLotPolicy toParkingLotPolicy() {
    return new ParkingLotPolicy(
      GracePeriod.of(this.gracePeriodMinutes, this.gracePeriodPrice),
      TaxRate.of(this.ivaRate));
  }
}
