package dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot;

import java.util.UUID;

import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
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
    boolean hasHistory,
    boolean hasCharger,
    boolean isAccessible,
    boolean isActive) {

}
