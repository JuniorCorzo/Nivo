package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto;

import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
public record SlotInfo(UUID id, String slotNumber, SlotType type, SlotStatus status) {}
