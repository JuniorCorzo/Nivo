package dev.angelcorzo.nivo.domain.model.payments.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.ErrorMessagesModel;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;

public class PaymentNotFound extends AppException {
  private static final int STATUS = 404;
  private static final String CODE = "PAYMENT_NOT_FOUND";

  public PaymentNotFound(String transactionId) {
    super(ErrorMessagesModel.PAYMENT_NOT_FOUND_BY_TRANSACTION_ID.format(transactionId), STATUS, CODE);
  }
}
