package dev.angelcorzo.nivo.api.slot.dto;

import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder(toBuilder = true)
public record UpdateSlotRequest(
    @NotNull UUID id,
    @NotEmpty String slotNumber,
    @NotEmpty SlotType type,
    @NotEmpty SlotStatus status) {}
