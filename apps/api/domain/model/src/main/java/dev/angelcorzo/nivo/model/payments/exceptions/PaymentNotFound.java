package dev.angelcorzo.nivo.model.payments.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;

public class PaymentNotFound extends RuntimeException {
  public PaymentNotFound(String transactionId) {
    super(ErrorMessagesModel.PAYMENT_NOT_FOUND_BY_TRANSACTION_ID.format(transactionId));
  }
}
