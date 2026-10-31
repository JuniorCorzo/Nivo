package dev.angelcorzo.nivo.domain.model.rates.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;
import java.util.UUID;

public class RateInUseException extends AppException {
  private static final int STATUS = 409;
  private static final String CODE = "RATE_IN_USE";

  public RateInUseException(UUID rateId) {
    super(
      "Rate with ID " + rateId + " cannot be deactivated because it is in use by active parking tickets.",
      STATUS,
      CODE);
  }
}
