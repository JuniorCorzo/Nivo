package dev.angelcorzo.nivo.api.parkinglots.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.time.OffsetTime;
import java.util.List;
import java.util.UUID;
import lombok.Builder;

/**
 * Enriched parking lot response for the list endpoint.
 *
 * <p>
 * Includes slot distribution breakdown and total capacity,
 * optimized for the list view without requiring additional queries.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
@Schema(description = "Parking lot with aggregated slot distribution", requiredProperties = { "id", "name",
    "address", "coordinates", "occuppationRate", "currency", "createdAt", "updatedAt", "slotDistribution", "ownerName",
    "totalCapacity" })
public record ParkingLotListItemResponse(
    UUID id,
    String name,
    AddressDTO address,
    CoordinatesDTO coordinates,
    Double occuppationRate,
    String currency,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<SlotDistributionResponse> slotDistribution,
    String ownerName,
    Long totalCapacity,
    OperatingHoursDTO operatingHours) {
}
