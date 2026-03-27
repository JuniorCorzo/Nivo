package dev.angelcorzo.nivo.model.payments.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class ConfirmPaymentException extends AppException {
  public ConfirmPaymentException(PaymentError error) {
    super(error.message(), error.status(), error.code());
  }
}
