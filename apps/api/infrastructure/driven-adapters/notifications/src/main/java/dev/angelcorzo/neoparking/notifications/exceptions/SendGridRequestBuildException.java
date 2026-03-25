package dev.angelcorzo.neoparking.notifications.exceptions;

/**
 * Thrown when a SendGrid {@link com.sendgrid.Request} cannot be built or when a network/IO error
 * occurs while dispatching it to the SendGrid API.
 */
public class SendGridRequestBuildException extends SendGridException {

  public SendGridRequestBuildException(String message, Throwable cause) {
    super(message, cause);
  }
}
