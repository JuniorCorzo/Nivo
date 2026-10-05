package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.commons.ParkingLotsInfo;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.specialpolicies.dto.SpecialPoliciesInfo;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.domain.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.domain.model.rates.enums.VehicleType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
@Schema(description = "Tariff rate details", requiredProperties = {
    "id",
    "tenant",
    "parking",
    "name",
    "description",
    "pricePerUnit",
    "timeUnit",
    "minChargeTimeMinutes",
    "vehicleType",
    "createdAt",
    "updatedAt"
})
public record RatesDTO(
    @Schema(description = "Rate ID", example = "f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66", requiredMode = Schema.RequiredMode.REQUIRED) UUID id,

    @Schema(description = "Tenant information", requiredMode = Schema.RequiredMode.REQUIRED) TenantInfo tenant,

    @Schema(description = "Parking lot information", requiredMode = Schema.RequiredMode.REQUIRED) ParkingLotsInfo parking,

    @Schema(description = "Rate name", example = "Standard Car Hourly", requiredMode = Schema.RequiredMode.REQUIRED) String name,

    @Schema(description = "Description of the rate", example = "Standard daytime rate for cars", requiredMode = Schema.RequiredMode.REQUIRED) String description,

    @Schema(description = "Price per time unit", example = "5.00", requiredMode = Schema.RequiredMode.REQUIRED) BigDecimal pricePerUnit,

    @Schema(description = "Unit of time (HOUR, DAY, etc.)", example = "HOURS", requiredMode = Schema.RequiredMode.REQUIRED) TimeUnitsRate timeUnit,

    @Schema(description = "Minimum charge time in minutes", example = "15", requiredMode = Schema.RequiredMode.REQUIRED) Integer minChargeTimeMinutes,

    @Schema(description = "Vehicle type applicability", example = "CAR", requiredMode = Schema.RequiredMode.REQUIRED) VehicleType vehicleType,

    @Schema(description = "Special policy applied to rate (if applicable)") SpecialPoliciesInfo specialPolicy,

    @Schema(description = "Creation timestamp", requiredMode = Schema.RequiredMode.REQUIRED) OffsetDateTime createdAt,

    @Schema(description = "Last update timestamp", requiredMode = Schema.RequiredMode.REQUIRED) OffsetDateTime updatedAt,

    @Schema(description = "Deletion timestamp (if deleted)") OffsetDateTime deletedAt) {
}
