package dev.angelcorzo.nivo.usecase.registertenant.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class BadCredentialsException extends AppException {
  private static final int STATUS = 401;
  private static final String CODE = "BAD_CREDENTIALS";

  public BadCredentialsException() {
    super(ErrorMessagesModel.USER_BAD_CREDENTIALS.toString(), STATUS, CODE);
  }
}
