package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(description = "Request payload for renaming zone/prefix of a slot group")
public record UpdateSlotGroupRequest(
    @Schema(description = "Parking lot ID", example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID parkingId,

    @Schema(description = "Current zone identifier (optional, can be blank/empty for slots without zone)", example = "NORTH")
    String currentZone,

    @Schema(description = "Current prefix identifier (optional, can be blank/empty for slots without prefix)", example = "A")
    String currentPrefix,

    @Schema(description = "New zone identifier", example = "SOUTH")
    String newZone,

    @Schema(description = "New prefix identifier", example = "B")
    String newPrefix) {}
