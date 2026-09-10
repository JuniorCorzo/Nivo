package dev.angelcorzo.nivo.domain.model.slots.excetions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;
import java.util.List;
import java.util.UUID;

public class SlotCannotBeModifiedException extends AppException {
  private static final int STATUS = 409;
  private static final String CODE = "SLOT_CANNOT_BE_MODIFIED";
  private final List<UUID> conflictingSlotIds;

  public SlotCannotBeModifiedException(List<UUID> conflictingSlotIds) {
    super("Slots cannot be modified because one or more are not available: " + conflictingSlotIds, STATUS, CODE);
    this.conflictingSlotIds = conflictingSlotIds;
  }

  public List<UUID> getConflictingSlotIds() {
    return conflictingSlotIds;
  }
}
