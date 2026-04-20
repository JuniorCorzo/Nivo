package dev.angelcorzo.nivo.model.parkinglots;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.Builder;

/**
 * Enriched read model representing a parking lot with aggregated slot
 * distribution
 * and owner information.
 *
 * <p>
 * This is a <strong>query-side model</strong> (CQRS read model) optimized for
 * the
 * parking lot list endpoint. Unlike the full {@link ParkingLots} aggregate,
 * this model
 * includes pre-computed slot counts and the owner's name, avoiding N+1 queries.
 *
 * <p>
 * <strong>Layer:</strong> Domain (Read Model)
 *
 * @param id               Unique identifier of the parking lot
 * @param name             Commercial name
 * @param address          Physical address value object
 * @param occuppationRate  Rate of occuppation slots in parking lot
 * @param coordinates      Geographic coordinates value object
 * @param currency         Currency code (e.g., "COP", "USD")
 * @param createdAt        Creation timestamp
 * @param updatedAt        Last update timestamp
 * @param slotDistribution Breakdown of slots by type (e.g., CAR: 10,
 *                         MOTORCYCLE: 5)
 * @param ownerName        Full name of the parking lot owner
 * @param totalCapacity    Total number of slots across all types
 * @see SlotDistributionEntry
 * @see ParkingLots
 */
@Builder(toBuilder = true)
public record ParkingLotListItem(
    UUID id,
    String name,
    Address address,
    Double occuppationRate,
    Coordinates coordinates,
    String currency,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<SlotDistributionEntry> slotDistribution,
    String ownerName,
    Long totalCapacity) {
}
