package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.publicapi;

import java.math.BigDecimal;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.OperationsTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.valueobjects.SpecialPoliciesReference;
import dev.angelcorzo.nivo.domain.usecase.rate.dtos.SimulateRateCommand;

@Schema(description = "Payload to simulate parking fee calculation", requiredProperties = {"vehicleType",
  "minutesStayed"})
public record SimulateRateRequest(
  @Schema(description = "Type of vehicle to calculate rate for", example = "CAR", requiredMode = Schema.RequiredMode.REQUIRED) @NotNull VehicleType vehicleType,

  @Schema(description = "Total stay duration in minutes (0 to 525600)", example = "90", maximum = "525600", requiredMode = Schema.RequiredMode.REQUIRED) @NotNull @PositiveOrZero @Max(SimulateRateCommand.MAX_MINUTES_STAYED) Long minutesStayed,

  @Schema(description = "Base price per time unit. Optional; defaults to standard vehicle rate if omitted", example = "4000.00") @PositiveOrZero BigDecimal pricePerUnit,

  @Schema(description = "Time unit associated with price. Optional; defaults to HOURS", example = "HOURS") TimeUnitsRate timeUnit,

  @Schema(description = "Grace period in minutes before billing starts. Optional; defaults to 15", example = "15") @PositiveOrZero Integer gracePeriodMinutes,

  @Schema(description = "Applicable IVA/VAT rate in decimal format. Optional; defaults to 0.19", example = "0.19") @PositiveOrZero BigDecimal ivaRate,

  @Schema(description = "Minimum charge time in minutes. Optional; defaults to 60 (or 1 when timeUnit is MINUTES)", example = "60") @PositiveOrZero Integer minChargeTimeMinutes,

  @Schema(description = "Flat fee charged when stay is within grace period. Optional; defaults to 0", example = "0.00") @PositiveOrZero BigDecimal gracePeriodPrice,

  @Schema(description = "Optional special policy applied to the rate") @Valid SimulateSpecialPolicyRequest specialPolicy,

  @Schema(description = "Optional display name for the simulated rate", example = "Carro Estándar") String rateName) {

  public record SimulateSpecialPolicyRequest(
    @Schema(description = "Policy display name", example = "Descuento nocturno") String name,
    @Schema(description = "Target aspect modified by policy", example = "PRICE", requiredMode = Schema.RequiredMode.REQUIRED) @NotNull ModifiesTypes modifies,
    @Schema(description = "Operation applied by policy", example = "PERCENTAGE", requiredMode = Schema.RequiredMode.REQUIRED) @NotNull OperationsTypes operation,
    @Schema(description = "Numeric value for the policy operation", example = "10.00", requiredMode = Schema.RequiredMode.REQUIRED) @NotNull @PositiveOrZero BigDecimal valueToModify,
    @Schema(description = "Whether the policy is active", example = "true") Boolean active) {

    public SpecialPoliciesReference toReference() {
      return new SpecialPoliciesReference(
        UUID.randomUUID(),
        this.name != null && !this.name.isBlank() ? this.name : "Política especial",
        this.modifies,
        this.operation,
        this.valueToModify,
        this.active == null || this.active);
    }
  }

  public SimulateRateCommand toCommand() {
    return SimulateRateCommand.builder()
      .vehicleType(this.vehicleType)
      .minutesStayed(this.minutesStayed != null ? this.minutesStayed : 0L)
      .pricePerUnit(this.pricePerUnit)
      .timeUnit(this.timeUnit)
      .gracePeriodMinutes(this.gracePeriodMinutes)
      .ivaRate(this.ivaRate)
      .minChargeTimeMinutes(this.minChargeTimeMinutes)
      .gracePeriodPrice(this.gracePeriodPrice)
      .specialPolicy(this.specialPolicy != null ? this.specialPolicy.toReference() : null)
      .rateName(this.rateName)
      .build();
  }
}
