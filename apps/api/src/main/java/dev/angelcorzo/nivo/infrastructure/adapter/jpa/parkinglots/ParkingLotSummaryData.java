package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Builder;

/**
 * Intermediate DTO that mirrors the columns returned by the
 * {@code findAllByTenantId} native query on {@code nivo.v_parking_lot_summaries}.
 *
 * <p>
 * Populated from {@code Tuple} by column name in the adapter mapper, then converted
 * to the domain read model via MapStruct.
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
    Long totalCapacity,
    String openTime,
    String closeTime,
    Integer gracePeriodMinutes,
    BigDecimal gracePeriodPrice,
    BigDecimal ivaRate) {
}
