package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(description = "Request payload for batch updating equipment metadata on slots")
public record UpdateSlotMetadataRequest(
    @Schema(description = "List of slot IDs to update", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull @NotEmpty List<UUID> slotIds,

    @Schema(description = "Whether the slots have EV charging equipment", example = "true")
    Boolean hasCharger,

    @Schema(description = "Whether the slots are PMR / accessible", example = "false")
    Boolean isAccessible,

    @Schema(description = "Whether the slots are active / operational", example = "true")
    Boolean isActive) {}
