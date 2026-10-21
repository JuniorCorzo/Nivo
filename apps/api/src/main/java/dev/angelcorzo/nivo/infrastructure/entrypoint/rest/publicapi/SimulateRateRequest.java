package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import java.math.BigDecimal;

import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.SimulateRateCommand;

public record SimulateRateRequest(
    VehicleType vehicleType,
    long minutesStayed,
    BigDecimal pricePerUnit,
    TimeUnitsRate timeUnit,
    Integer gracePeriodMinutes,
    BigDecimal ivaRate
) {

  public SimulateRateCommand toCommand() {
    return SimulateRateCommand.of(
        this.vehicleType,
        this.minutesStayed,
        this.pricePerUnit,
        this.timeUnit,
        this.gracePeriodMinutes,
        this.ivaRate
    );
  }
}
