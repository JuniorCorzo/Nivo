package dev.angelcorzo.nivo.infrastructure.adapter.payment;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;

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
