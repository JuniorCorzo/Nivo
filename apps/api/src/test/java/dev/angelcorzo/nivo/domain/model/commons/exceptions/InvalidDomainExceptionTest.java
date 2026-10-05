package dev.angelcorzo.nivo.domain.model.commons.exceptions;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class InvalidDomainExceptionTest {

  @Test
  @DisplayName("Should create exception with message, status 400, and code INVALID_DOMAIN_STATE")
  void shouldCreateExceptionWithMessage() {
    String message = "Domain entity state is invalid";

    InvalidDomainException exception = new InvalidDomainException(message);

    assertThat(exception.getMessage()).isEqualTo(message);
    assertThat(exception.getStatus()).isEqualTo(400);
    assertThat(exception.getCode()).isEqualTo("INVALID_DOMAIN_STATE");
    assertThat(exception.getCause()).isNull();
  }

  @Test
  @DisplayName("Should create exception with message, cause, status 400, and code INVALID_DOMAIN_STATE")
  void shouldCreateExceptionWithMessageAndCause() {
    String message = "Domain entity state is invalid";
    Throwable cause = new IllegalArgumentException("Root cause");

    InvalidDomainException exception = new InvalidDomainException(message, cause);

    assertThat(exception.getMessage()).isEqualTo(message);
    assertThat(exception.getStatus()).isEqualTo(400);
    assertThat(exception.getCode()).isEqualTo("INVALID_DOMAIN_STATE");
    assertThat(exception.getCause()).isSameAs(cause);
  }
}
