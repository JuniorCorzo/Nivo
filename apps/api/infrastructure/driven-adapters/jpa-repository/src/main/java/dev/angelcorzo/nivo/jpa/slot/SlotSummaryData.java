package dev.angelcorzo.nivo.jpa.slot;

import java.util.UUID;

import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import lombok.Builder;

@Builder(toBuilder = true)
public record SlotSummaryData(
    UUID id,
    String parkingName,
    SlotType type,
    String prefix,
    String zone,
    String numberSlot,
    SlotStatus status,
    boolean hasTicket,
    boolean hasHistory) {

}
