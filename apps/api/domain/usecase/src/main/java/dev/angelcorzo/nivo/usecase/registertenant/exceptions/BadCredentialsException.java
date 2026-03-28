package dev.angelcorzo.nivo.usecase.registertenant.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;

public class BadCredentialsException extends RuntimeException {
  public BadCredentialsException() {
    super(ErrorMessagesModel.USER_BAD_CREDENTIALS.toString());
  }
}
