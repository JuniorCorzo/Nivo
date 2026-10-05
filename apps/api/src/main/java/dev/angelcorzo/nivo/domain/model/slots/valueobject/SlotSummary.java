package dev.angelcorzo.nivo.domain.model.slots.valueobject;

import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
public record SlotSummary(
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
    boolean isActive
) {}
