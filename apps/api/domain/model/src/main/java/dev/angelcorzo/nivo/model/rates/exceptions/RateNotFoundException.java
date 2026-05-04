package dev.angelcorzo.nivo.model.rates.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class RateNotFoundException extends AppException {
  private static final int STATUS = 404;
  private static final String CODE = "RATE_NOT_FOUND";

  public RateNotFoundException(UUID id) {
    super(ErrorMessagesModel.RATE_NOT_FOUND.format(id), STATUS, CODE);
  }
}
