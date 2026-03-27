package dev.angelcorzo.nivo.model.payments.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;
import dev.angelcorzo.nivo.model.commons.result.DomainError;

public class ProcessPaymentException extends AppException {
  public ProcessPaymentException(DomainError error) {
    super(error.message(), error.status(), error.code());
  }
}
