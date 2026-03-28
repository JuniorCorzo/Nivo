package dev.angelcorzo.nivo.api.slot.dto;

import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
public record CreateSlotRequest(
    @NotNull UUID parkingLotId, @NotEmpty String slotNumber, @NotEmpty SlotType type) {}
