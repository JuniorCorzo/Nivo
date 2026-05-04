package dev.angelcorzo.nivo.paymentprovider;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class SignatureInvalid extends AppException {
  private static final int STATUS = 400;
  private static final String CODE = "SIGNATURE_INVALID";

  public SignatureInvalid() {
    super("Invalid signature", STATUS, CODE);
  }

  public SignatureInvalid(String message) {
    super(message, STATUS, CODE);
  }
}
