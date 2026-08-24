package dev.angelcorzo.nivo.api.slot.dto;

import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Schema(requiredMode = Schema.RequiredMode.REQUIRED, requiredProperties = { "slotType", "numberSlots" })
public record CreatedSlots(
    String prefix,
    String zone,
    @NotNull SlotType slotType,
    @Min(1) Integer numberSlots) {
}
