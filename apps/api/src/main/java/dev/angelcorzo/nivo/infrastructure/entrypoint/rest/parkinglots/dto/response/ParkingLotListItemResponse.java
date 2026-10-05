package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.commons.AddressDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.commons.CoordinatesDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.commons.OperatingHoursDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
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
    "totalCapacity", "operatingHours", "gracePeriodMinutes", "gracePeriodPrice", "ivaRate" })
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
    OperatingHoursDTO operatingHours,
    Integer gracePeriodMinutes,
    BigDecimal gracePeriodPrice,
    BigDecimal ivaRate) {
}
