package dev.angelcorzo.nivo.domain.model.rates.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;
import dev.angelcorzo.nivo.domain.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

public class RateInUseException extends AppException {
  private static final int STATUS = 409;
  private static final String CODE = "RATE_IN_USE";

  public RateInUseException(final UUID rateId) {
    super(ErrorMessagesModel.RATE_IN_USE.format(rateId), STATUS, CODE);
  }
}
