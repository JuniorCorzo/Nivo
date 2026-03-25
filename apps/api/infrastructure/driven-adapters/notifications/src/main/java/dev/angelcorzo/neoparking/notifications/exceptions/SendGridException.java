package dev.angelcorzo.neoparking.notifications.exceptions;

/** Base exception for all SendGrid-related failures. */
public class SendGridException extends RuntimeException {

  public SendGridException(String message) {
    super(message);
  }

  public SendGridException(String message, Throwable cause) {
    super(message, cause);
  }
}
