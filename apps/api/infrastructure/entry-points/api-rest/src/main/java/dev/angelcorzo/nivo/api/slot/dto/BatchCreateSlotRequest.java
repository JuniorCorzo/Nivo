package dev.angelcorzo.nivo.api.slot.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

@Schema(description = "Payload to batch create slots for a parking lot")
public record BatchCreateSlotRequest(
    @Schema(description = "Parking lot ID", example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID parkingLotId,

    @Schema(description = "List of slot definitions to create", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty List<@Valid CreatedSlots> slots) {}

