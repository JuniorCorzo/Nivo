package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.security.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import io.sentry.Sentry;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

@DisplayName("SentryConfig Tests")
class SentryConfigTest {

  private SentryConfig sentryConfig;

  @BeforeEach
  void setUp() {
    Sentry.close();
    sentryConfig = new SentryConfig();
  }

  @AfterEach
  void tearDown() {
    Sentry.close();
  }

  @Test
  @DisplayName("Should initialize and enable Sentry when DSN is provided")
  void shouldInitializeSentryWhenDsnIsProvided() {
    ReflectionTestUtils.setField(sentryConfig, "dsn", "https://key@sentry.example.com/12345");
    ReflectionTestUtils.setField(sentryConfig, "tracesSampleRate", 0.5);
    ReflectionTestUtils.setField(sentryConfig, "environment", "test");

    sentryConfig.init();

    assertThat(Sentry.isEnabled()).isTrue();
  }

  @Test
  @DisplayName("Should not throw and keep Sentry disabled when DSN is empty")
  void shouldNotThrowWhenDsnIsEmpty() {
    ReflectionTestUtils.setField(sentryConfig, "dsn", "");

    assertThatCode(() -> sentryConfig.init()).doesNotThrowAnyException();
    assertThat(Sentry.isEnabled()).isFalse();
  }

  @Test
  @DisplayName("Should not throw and keep Sentry disabled when DSN is blank")
  void shouldNotThrowWhenDsnIsBlank() {
    ReflectionTestUtils.setField(sentryConfig, "dsn", "   ");

    assertThatCode(() -> sentryConfig.init()).doesNotThrowAnyException();
    assertThat(Sentry.isEnabled()).isFalse();
  }

  @Test
  @DisplayName("Should not throw and keep Sentry disabled when DSN is null")
  void shouldNotThrowWhenDsnIsNull() {
    ReflectionTestUtils.setField(sentryConfig, "dsn", null);

    assertThatCode(() -> sentryConfig.init()).doesNotThrowAnyException();
    assertThat(Sentry.isEnabled()).isFalse();
  }
}
