package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.SimulateRateCommand;

@Schema(description = "Payload to simulate parking fee calculation", requiredProperties = {"vehicleType",
  "minutesStayed"})
public record SimulateRateRequest(
  @Schema(description = "Type of vehicle to calculate rate for", example = "CAR", requiredMode = Schema.RequiredMode.REQUIRED) @NotNull VehicleType vehicleType,

  @Schema(description = "Total stay duration in minutes", example = "90", requiredMode = Schema.RequiredMode.REQUIRED) @NotNull @PositiveOrZero Long minutesStayed,

  @Schema(description = "Base price per time unit. Optional; defaults to standard vehicle rate if omitted", example = "4000.00") @PositiveOrZero BigDecimal pricePerUnit,

  @Schema(description = "Time unit associated with price. Optional; defaults to HOURS", example = "HOURS") TimeUnitsRate timeUnit,

  @Schema(description = "Grace period in minutes before billing starts. Optional; defaults to 15", example = "15") @PositiveOrZero Integer gracePeriodMinutes,

  @Schema(description = "Applicable IVA/VAT rate in decimal format. Optional; defaults to 0.19", example = "0.19") @PositiveOrZero BigDecimal ivaRate) {

  public SimulateRateCommand toCommand() {
    return SimulateRateCommand.of(
      this.vehicleType,
      this.minutesStayed != null ? this.minutesStayed : 0L,
      this.pricePerUnit,
      this.timeUnit,
      this.gracePeriodMinutes,
      this.ivaRate);
  }
}
