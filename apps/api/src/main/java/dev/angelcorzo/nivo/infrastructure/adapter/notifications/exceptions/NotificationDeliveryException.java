package dev.angelcorzo.nivo.infrastructure.adapter.notifications.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;
import lombok.Getter;

@Getter
public class NotificationDeliveryException extends AppException {
  private static final String DEFAULT_ERROR_CODE = "NOTIFICATION_DELIVERY_ERROR";

  private final int statusCode;
  private final String providerName;

  public NotificationDeliveryException(int statusCode, String providerName, String message) {
    super(message, statusCode, DEFAULT_ERROR_CODE);
    this.statusCode = statusCode;
    this.providerName = providerName;
  }

  public NotificationDeliveryException(
    int statusCode, String providerName, String message, Throwable cause) {
    super(message, statusCode, DEFAULT_ERROR_CODE, cause);
    this.statusCode = statusCode;
    this.providerName = providerName;
  }

  public boolean isRetryable() {
    return switch (this.statusCode) {
      case 429, 500, 502, 503, 504 -> true;
      default -> false;
    };
  }
}
