package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import java.util.UUID;
import lombok.Builder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
public record SlotSummaryResponse(
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
    boolean isActive) {}
