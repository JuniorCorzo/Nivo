package dev.angelcorzo.nivo.model.users.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class UserAuthenticationContextInvalidException extends AppException {
  private static final int STATUS = 401;
  private static final String CODE = "AUTH_CONTEXT_INVALID";

  public UserAuthenticationContextInvalidException() {
    super(ErrorMessagesModel.USER_AUTHENTICATION_INVALID.format(), STATUS, CODE);
  }
}
