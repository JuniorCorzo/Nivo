package dev.angelcorzo.nivo.model.parkinglots;

import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import lombok.Builder;

/**
 * Represents a single entry in the slot distribution of a parking lot.
 *
 * <p>
 * Maps a vehicle slot type to its total count within a parking lot.
 * Used as part of the enriched parking lot list read model.
 *
 * <p>
 * <strong>Layer:</strong> Domain (Read Model Value Object)
 *
 * @param type  The slot type (CAR, MOTORCYCLE, BIKE, etc.)
 * @param count The total number of slots of this type
 */
@Builder(toBuilder = true)
public record SlotDistributionEntry(String prefix, String zone, SlotType type, Long count) {
}
