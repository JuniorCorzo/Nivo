package dev.angelcorzo.nivo.domain.model.payments.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;

public class ConfirmPaymentException extends AppException {
  public ConfirmPaymentException(PaymentError error) {
    super(error.message(), error.status(), error.code());
  }
}
