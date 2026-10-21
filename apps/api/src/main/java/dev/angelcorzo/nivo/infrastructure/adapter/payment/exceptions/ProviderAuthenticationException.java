package dev.angelcorzo.nivo.infrastructure.adapter.payment.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;

public class ProviderAuthenticationException extends AppException {

  public ProviderAuthenticationException(String message, int status) {
    super(message, status, "PROVIDER_AUTHENTICATION_FAILED");
  }

  public ProviderAuthenticationException(String message, int status, Throwable cause) {
    super(message, status, "PROVIDER_AUTHENTICATION_FAILED", cause);
  }
}
