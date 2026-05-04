package dev.angelcorzo.nivo.notifications.exceptions;

import lombok.Getter;

/**
 * Thrown when SendGrid returns an HTTP response with a non-2xx status code. Carries the raw status
 * code and response body to allow callers to inspect or log the provider error.
 */
@Getter
public class SendGridApiException extends SendGridException {

  private final int statusCode;
  private final String responseBody;

  public SendGridApiException(int statusCode, String responseBody) {
    super("SendGrid API returned non-2xx status " + statusCode + ". Body: " + responseBody, statusCode, "SENDGRID_API_ERROR");
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}
