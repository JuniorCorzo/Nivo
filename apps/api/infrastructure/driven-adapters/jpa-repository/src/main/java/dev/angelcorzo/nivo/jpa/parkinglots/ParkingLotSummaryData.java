package dev.angelcorzo.nivo.jpa.parkinglots;

import java.time.Instant;
import java.util.UUID;
import lombok.Builder;

/**
 * Intermediate DTO that mirrors the exact column order returned by the
 * {@code findAllByTenantId} native query.
 *
 * <p>
 * Populated from {@code Object[]} by index in the adapter, then converted
 * to the domain read model via MapStruct.
 *
 * <p>
 * <strong>Column index mapping (MUST match SQL SELECT order):</strong>
 * 
 * <pre>
 *   [0]  id                → UUID
 *   [1]  name              → String
 *   [2]  currency          → String
 *   [3]  occuppation_rate  → Double
 *   [4]  created_at        → Instant
 *   [5]  updated_at        → Instant
 *   [6]  deleted_at        → Instant
 *   [7]  street            → String
 *   [8]  city              → String
 *   [9]  state             → String
 *   [10] country           → String
 *   [11] zip_code          → String
 *   [12] latitude          → Double
 *   [13] longitude         → Double
 *   [14] slot_distribution → String (JSON)
 *   [15] owner_name        → String
 *   [16] total_capacity    → Long
 * </pre>
 *
 * <p>
 * <strong>Layer:</strong> Infrastructure (Driven Adapter — internal DTO)
 */
@Builder(toBuilder = true)
public record ParkingLotSummaryData(
    UUID id,
    String name,
    String currency,
    Double occuppationRate,
    Instant createdAt,
    Instant updatedAt,
    Instant deletedAt,
    String street,
    String city,
    String state,
    String country,
    String zipCode,
    Double latitude,
    Double longitude,
    String slotDistribution,
    String ownerName,
    Long totalCapacity) {
}
