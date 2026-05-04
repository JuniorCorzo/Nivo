package dev.angelcorzo.nivo.notifications.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

/** Base exception for all SendGrid-related failures. */
public class SendGridException extends AppException {

  protected SendGridException(String message, int status, String code) {
    super(message, status, code);
  }

  protected SendGridException(String message, int status, String code, Throwable cause) {
    super(message, status, code, cause);
  }
}
