package dev.angelcorzo.nivo.infrastructure.adapter.notifications.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;

/** Base exception for all SendGrid-related failures. */
public class SendGridException extends AppException {

  protected SendGridException(String message, int status, String code) {
    super(message, status, code);
  }

  protected SendGridException(String message, int status, String code, Throwable cause) {
    super(message, status, code, cause);
  }
}
