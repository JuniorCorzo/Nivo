package dev.angelcorzo.nivo.domain.model.commons.exceptions;

public class InvalidDomainException extends AppException {
  private static final int STATUS = 400;
  private static final String CODE = "INVALID_DOMAIN_STATE";

  public InvalidDomainException(String message) {
    super(message, STATUS, CODE);
  }

  public InvalidDomainException(String message, Throwable cause) {
    super(message, STATUS, CODE, cause);
  }
}
