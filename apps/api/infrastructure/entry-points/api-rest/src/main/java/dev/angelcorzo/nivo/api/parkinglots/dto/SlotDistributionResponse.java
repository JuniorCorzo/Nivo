package dev.angelcorzo.nivo.api.parkinglots.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

/**
 * Represents a single slot type entry in the parking lot's slot distribution.
 *
 * @param type  The slot type name (e.g., "CAR", "MOTORCYCLE")
 * @param count The total number of slots of this type
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
@Schema(description = "Slot count breakdown by vehicle type", requiredProperties = { "prefix", "zone", "type",
    "count" })
public record SlotDistributionResponse(String prefix, String zone, String type, Long count) {
}
