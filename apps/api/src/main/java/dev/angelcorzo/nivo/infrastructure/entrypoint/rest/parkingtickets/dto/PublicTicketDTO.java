package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkingtickets.dto;

import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.ParkingTicketStatus;
import dev.angelcorzo.nivo.domain.model.parkingtickets.enums.PlateCountry;
import dev.angelcorzo.nivo.domain.model.parkingtickets.valueobjects.SlotSnapshot;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.rates.dto.RatesInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(
    description = "Public parking ticket details for unauthenticated driver access",
    requiredProperties = {"id", "licensePlate", "plateCountry", "entryTime", "status", "rate"})
public record PublicTicketDTO(
    @Schema(description = "Unique ticket identifier", example = "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", requiredMode = Schema.RequiredMode.REQUIRED)
    UUID id,

    @Schema(description = "License plate or synthetic code (e.g. SP-1042)", example = "SP-1042", requiredMode = Schema.RequiredMode.REQUIRED)
    String licensePlate,

    @Schema(description = "Plate origin country (CO, VE, UNPLATED)", example = "UNPLATED", requiredMode = Schema.RequiredMode.REQUIRED)
    PlateCountry plateCountry,

    @Schema(description = "URL to photo proof of vehicle", example = "https://storage.nivo.dev/photos/bike-123.jpg", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String photoUrl,

    @Schema(description = "Driver phone number for notifications", example = "+573001234567", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    String phoneNumber,

    @Schema(description = "Vehicle entry timestamp in Bogota timezone", requiredMode = Schema.RequiredMode.REQUIRED)
    ZonedDateTime entryTime,

    @Schema(description = "Vehicle exit timestamp in Bogota timezone", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    ZonedDateTime exitTime,

    @Schema(description = "Ticket lifecycle status", example = "OPEN", requiredMode = Schema.RequiredMode.REQUIRED)
    ParkingTicketStatus status,

    @Schema(description = "Snapshot of the assigned slot at check-in time", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    SlotSnapshot slotSnapshot,

    @Schema(description = "Applied rate details", requiredMode = Schema.RequiredMode.REQUIRED)
    RatesInfo rate,

    @Schema(description = "Total accumulated charge amount", example = "5000.00", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    BigDecimal totalToCharge) {}
