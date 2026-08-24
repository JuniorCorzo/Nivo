package dev.angelcorzo.nivo.model.slots.valueobject;

import java.util.UUID;

import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;

public record SlotSummary(UUID id, String parkingName, SlotType type, String prefix, String zone,
    String numberSlot, SlotStatus status, boolean hasTicket, boolean hasHistory) {
}
