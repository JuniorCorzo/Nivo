package dev.angelcorzo.nivo.model.slots.valueobject;

import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
public record SlotsReference(UUID id, String slotNumber, SlotType type, SlotStatus status) {
  public static SlotsReference of(Slots slot) {
    return new SlotsReference(slot.getId(), slot.getSlotNumber(), slot.getType(), slot.getStatus());
  }
}
