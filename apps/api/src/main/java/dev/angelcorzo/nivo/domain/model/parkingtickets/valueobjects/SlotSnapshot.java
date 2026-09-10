package dev.angelcorzo.nivo.domain.model.parkingtickets.valueobjects;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
public record SlotSnapshot(
    UUID id,
    String slotNumber,
    String zone,
    String prefix,
    SlotType type,
    boolean hasCharger,
    boolean isAccessible
) {
  public static SlotSnapshot from(Slots slot) {
    return new SlotSnapshot(
        slot.getId(),
        slot.getSlotNumber(),
        slot.getZone(),
        slot.getPrefix(),
        slot.getType(),
        slot.isHasCharger(),
        slot.isAccessible()
    );
  }
}
