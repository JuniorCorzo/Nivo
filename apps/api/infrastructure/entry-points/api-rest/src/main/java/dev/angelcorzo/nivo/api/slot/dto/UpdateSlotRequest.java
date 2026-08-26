package dev.angelcorzo.nivo.api.slot.dto;

import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(description = "Payload to update a parking slot")
public record UpdateSlotRequest(
    @Schema(description = "Slot ID", example = "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID id,

    @Schema(description = "Slot number or identifier", example = "A-101", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty String slotNumber,

    @Schema(description = "Slot vehicle type", example = "STANDARD", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull SlotType type,

    @Schema(description = "Slot current status", example = "AVAILABLE", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull SlotStatus status) {}

