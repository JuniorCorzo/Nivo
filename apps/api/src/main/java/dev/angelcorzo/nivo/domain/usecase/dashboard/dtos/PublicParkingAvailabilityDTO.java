package dev.angelcorzo.nivo.domain.usecase.dashboard.dtos;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;

@Builder
public record PublicParkingAvailabilityDTO(
    UUID parkingId,
    String parkingName,
    long totalSlots,
    long availableSlots,
    long occupiedSlots,
    OffsetDateTime timestamp) {}
