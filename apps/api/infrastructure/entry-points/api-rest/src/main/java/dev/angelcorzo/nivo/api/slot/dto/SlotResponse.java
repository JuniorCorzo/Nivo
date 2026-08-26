package dev.angelcorzo.nivo.api.slot.dto;

import dev.angelcorzo.nivo.api.parkinglots.dto.ParkingLotsInfo;
import dev.angelcorzo.nivo.api.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder(toBuilder = true)
@Schema(description = "Parking slot details")
public record SlotResponse(
    @Schema(description = "Slot ID", example = "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55")
    UUID id,

    @Schema(description = "Tenant information")
    TenantInfo tenant,

    @Schema(description = "Parking lot information")
    ParkingLotsInfo parking,

    @Schema(description = "Slot identifier / number", example = "A-101")
    String slotNumber,

    @Schema(description = "Vehicle slot type", example = "STANDARD")
    SlotType type,

    @Schema(description = "Current slot status", example = "AVAILABLE")
    SlotStatus status,

    @Schema(description = "Creation timestamp")
    OffsetDateTime createdAt,

    @Schema(description = "Last update timestamp")
    OffsetDateTime updatedAt,

    @Schema(description = "Deletion timestamp (if deleted)")
    OffsetDateTime deletedAt) {}

