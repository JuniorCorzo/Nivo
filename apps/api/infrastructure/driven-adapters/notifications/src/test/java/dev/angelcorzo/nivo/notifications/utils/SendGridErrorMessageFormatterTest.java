package dev.angelcorzo.nivo.notifications.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("SendGridErrorMessageFormatter Unit Tests")
class SendGridErrorMessageFormatterTest {

  private final SendGridErrorMessageFormatter formatter = new SendGridErrorMessageFormatter();

  @Test
  @DisplayName("Should format error with JSON errors array")
  void shouldFormatJsonErrors() {
    String json = "{\"errors\": [{\"message\": \"The from address does not match a verified Sender Identity\"}]}";
    String formatted = formatter.formatProviderError(400, json);

    assertThat(formatted).isEqualTo("SendGrid status=400, message=The from address does not match a verified Sender Identity");
  }

  @Test
  @DisplayName("Should format error with empty response body")
  void shouldFormatEmptyBody() {
    String formatted = formatter.formatProviderError(500, null);

    assertThat(formatted).isEqualTo("SendGrid status=500, message=Empty response body");
  }

  @Test
  @DisplayName("Should format IO error")
  void shouldFormatIoError() {
    String formatted = formatter.formatIoError("Connection reset");

    assertThat(formatted).isEqualTo("SendGrid IO error: Connection reset");
  }
}
