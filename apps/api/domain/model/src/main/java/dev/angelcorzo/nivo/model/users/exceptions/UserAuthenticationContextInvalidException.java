package dev.angelcorzo.nivo.model.users.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;

public class UserAuthenticationContextInvalidException extends RuntimeException {
  public UserAuthenticationContextInvalidException() {
    super(ErrorMessagesModel.USER_AUTHENTICATION_INVALID.format());
  }
}
