package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.dto;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.specialpolicies.dto.SpecialPoliciesInfo;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(
    description = "Summary information of a tariff rate",
    requiredProperties = {
      "id",
      "name",
      "description",
      "pricePerUnit",
      "timeUnit",
      "minChargeTimeMinutes",
      "vehicleType"
    })
public record RatesInfo(
    @Schema(description = "Rate ID", example = "f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66", requiredMode = Schema.RequiredMode.REQUIRED)
    UUID id,

    @Schema(description = "Rate name", example = "Standard Car Hourly", requiredMode = Schema.RequiredMode.REQUIRED)
    String name,

    @Schema(description = "Description of the rate", example = "Standard daytime rate for cars", requiredMode = Schema.RequiredMode.REQUIRED)
    String description,

    @Schema(description = "Price per time unit", example = "5.00", requiredMode = Schema.RequiredMode.REQUIRED)
    BigDecimal pricePerUnit,

    @Schema(description = "Unit of time (HOUR, DAY, etc.)", example = "HOURS", requiredMode = Schema.RequiredMode.REQUIRED)
    TimeUnitsRate timeUnit,

    @Schema(description = "Minimum charge time in minutes", example = "15", requiredMode = Schema.RequiredMode.REQUIRED)
    Integer minChargeTimeMinutes,

    @Schema(description = "Vehicle type applicability", example = "CAR", requiredMode = Schema.RequiredMode.REQUIRED)
    VehicleType vehicleType,

    @Schema(description = "Special policy applied to rate (if applicable)")
    SpecialPoliciesInfo specialPolicy) {}
