package dev.angelcorzo.nivo.model.slots.excetions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

public class SlotNotFoundException extends RuntimeException {
  public SlotNotFoundException(UUID id) {
    super(ErrorMessagesModel.USER_NOT_EXIST_ID.format(id));
  }
}
