package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.commons;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(
    description = "Parking lot summary reference",
    requiredProperties = {
      "id",
      "name",
      "address",
      "coordinates",
      "timezone",
      "currency",
      "operatingHours"
    })
public record ParkingLotsInfo(
    @Schema(description = "Parking lot ID", example = "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55", requiredMode = Schema.RequiredMode.REQUIRED)
    UUID id,

    @Schema(description = "Parking lot name", example = "Central Parking", requiredMode = Schema.RequiredMode.REQUIRED)
    String name,

    @Schema(description = "Address", requiredMode = Schema.RequiredMode.REQUIRED)
    AddressDTO address,

    @Schema(description = "Coordinates", requiredMode = Schema.RequiredMode.REQUIRED)
    CoordinatesDTO coordinates,

    @Schema(description = "Timezone", example = "America/Bogota", requiredMode = Schema.RequiredMode.REQUIRED)
    String timezone,

    @Schema(description = "Currency", example = "COP", requiredMode = Schema.RequiredMode.REQUIRED)
    String currency,

    @Schema(description = "Operating hours", requiredMode = Schema.RequiredMode.REQUIRED)
    OperatingHoursDTO operatingHours) {}
