package dev.angelcorzo.nivo.domain.usecase.dashboard.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;

@Builder
@Schema(description = "Publicly sanitized real-time parking slot availability information")
public record PublicParkingAvailabilityDTO(
    @Schema(description = "Unique identifier of the parking facility", example = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d")
    UUID parkingId,

    @Schema(description = "Commercial name of the parking facility", example = "Sede Centro")
    String parkingName,

    @Schema(description = "Total capacity of configured parking slots", example = "100")
    long totalSlots,

    @Schema(description = "Number of vacant slots currently available for incoming vehicles", example = "45")
    long availableSlots,

    @Schema(description = "Number of parking slots currently occupied", example = "55")
    long occupiedSlots,

    @Schema(description = "Timestamp when the availability state was calculated", example = "2026-09-25T14:30:00Z")
    OffsetDateTime timestamp) {}
