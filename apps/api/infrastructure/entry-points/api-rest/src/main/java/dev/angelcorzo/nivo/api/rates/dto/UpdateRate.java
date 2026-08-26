package dev.angelcorzo.nivo.api.rates.dto;

import dev.angelcorzo.nivo.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.model.rates.enums.VehicleType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(description = "Payload to update a tariff rate")
public record UpdateRate(
    @Schema(description = "Rate ID", example = "f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID id,

    @Schema(description = "Rate name", example = "Standard Car Hourly", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty String name,

    @Schema(description = "Description of the rate", example = "Standard daytime rate for cars", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty String description,

    @Schema(description = "Price per time unit", example = "5.00", requiredMode = Schema.RequiredMode.REQUIRED)
    @Min(value = 0) BigDecimal pricePerUnit,

    @Schema(description = "Unit of time (HOUR, DAY, etc.)", example = "HOUR", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull TimeUnitsRate timeUnit,

    @Schema(description = "Minimum charge time in minutes", example = "15", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull String minChargeTimeMinutes,

    @Schema(description = "Vehicle type applicability", example = "CAR", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull VehicleType vehicleType) {}

