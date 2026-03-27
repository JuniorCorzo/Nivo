package dev.angelcorzo.nivo.api.slot.dto;

import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
public record SlotInfo(UUID id, String slotNumber, SlotType type, SlotStatus status) {}
