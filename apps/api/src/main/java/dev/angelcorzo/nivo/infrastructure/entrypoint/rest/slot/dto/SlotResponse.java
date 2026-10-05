package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.commons.ParkingLotsInfo;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder(toBuilder = true)
@Schema(
    description = "Parking slot details",
    requiredProperties = {
      "id",
      "tenant",
      "parking",
      "slotNumber",
      "type",
      "status",
      "createdAt",
      "updatedAt",
      "hasCharger",
      "isAccessible",
      "isActive"
    })
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
    OffsetDateTime deletedAt,

    @Schema(description = "Whether slot has EV charger equipment", example = "false")
    boolean hasCharger,

    @Schema(description = "Whether slot is PMR / accessible", example = "false")
    boolean isAccessible,

    @Schema(description = "Whether slot is active and operational", example = "true")
    boolean isActive) {}

