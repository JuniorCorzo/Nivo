package dev.angelcorzo.nivo.model.slots.excetions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class SlotNotFoundException extends AppException {
  private static final int STATUS = 404;
  private static final String CODE = "SLOT_NOT_FOUND";

  public SlotNotFoundException(UUID id) {
    super(ErrorMessagesModel.SLOT_NOT_EXISTS.format(id), STATUS, CODE);
  }
}
