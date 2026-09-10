package dev.angelcorzo.nivo.domain.model.slots.excetions;

import java.util.List;
import java.util.UUID;

public class SlotCannotBeModifiedException extends RuntimeException {
  private final List<UUID> conflictingSlotIds;

  public SlotCannotBeModifiedException(List<UUID> conflictingSlotIds) {
    super("Slots cannot be modified because one or more are not available: " + conflictingSlotIds);
    this.conflictingSlotIds = conflictingSlotIds;
  }

  public List<UUID> getConflictingSlotIds() {
    return conflictingSlotIds;
  }
}
