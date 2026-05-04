package dev.angelcorzo.nivo.paymentprovider.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class PaymentProviderDeserializationException extends AppException {
  private static final int STATUS = 500;
  private static final String CODE = "PAYMENT_PROVIDER_DESERIALIZATION_ERROR";

  public PaymentProviderDeserializationException(String message, Throwable cause) {
    super(message, STATUS, CODE, cause);
  }
}
