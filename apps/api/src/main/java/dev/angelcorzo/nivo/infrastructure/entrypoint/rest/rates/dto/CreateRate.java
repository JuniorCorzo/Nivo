package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.dto;

import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(
    description = "Payload to create a new tariff rate",
    requiredProperties = {
      "parkingLotId",
      "name",
      "description",
      "pricePerUnit",
      "timeUnit",
      "minChargeTimeMinutes",
      "vehicleType"
    })
public record CreateRate(
    @Schema(description = "Parking lot ID", example = "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID parkingLotId,

    @Schema(description = "Rate name", example = "Standard Car Hourly", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty String name,

    @Schema(description = "Description of the rate", example = "Standard daytime rate for cars", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty String description,

    @Schema(description = "Price per time unit", example = "5.00", requiredMode = Schema.RequiredMode.REQUIRED)
    @Min(value = 0) BigDecimal pricePerUnit,

    @Schema(description = "Unit of time (HOUR, DAY, etc.)", example = "HOURS", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull TimeUnitsRate timeUnit,

    @Schema(description = "Minimum charge time in minutes", example = "15", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull Integer minChargeTimeMinutes,

    @Schema(description = "Vehicle type applicability", example = "CAR", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull VehicleType vehicleType,

    @Schema(description = "Optional special policy ID", example = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    UUID specialPolicyId) {}
