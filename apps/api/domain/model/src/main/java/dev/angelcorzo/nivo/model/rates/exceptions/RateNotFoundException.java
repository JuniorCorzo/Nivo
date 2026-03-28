package dev.angelcorzo.nivo.model.rates.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

public class RateNotFoundException extends RuntimeException {
  public RateNotFoundException(UUID id) {
    super(ErrorMessagesModel.RATE_NOT_FOUND.format(id));
  }
}
