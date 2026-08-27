package dev.angelcorzo.nivo.notifications.exceptions.retrypredicates;

import static org.assertj.core.api.Assertions.assertThat;

import dev.angelcorzo.nivo.notifications.exceptions.SendGridApiException;
import dev.angelcorzo.nivo.notifications.exceptions.SendGridRequestBuildException;
import java.lang.reflect.Method;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("EmailExceptionPredicate Unit Tests")
class EmailExceptionPredicateTest {

  private final EmailExceptionPredicate predicate = new EmailExceptionPredicate();
  private final Method dummyMethod = Object.class.getMethods()[0];

  @ParameterizedTest
  @ValueSource(ints = {500, 502, 503, 504})
  @DisplayName("Should retry on SendGrid 5xx status codes")
  void shouldRetryOn5xx(int statusCode) {
    SendGridApiException exception = new SendGridApiException(statusCode, "Error");

    boolean result = predicate.shouldRetry(dummyMethod, exception);

    assertThat(result).isTrue();
  }

  @ParameterizedTest
  @ValueSource(ints = {400, 401, 403, 404, 422})
  @DisplayName("Should not retry on SendGrid 4xx status codes")
  void shouldNotRetryOn4xx(int statusCode) {
    SendGridApiException exception = new SendGridApiException(statusCode, "Bad request");

    boolean result = predicate.shouldRetry(dummyMethod, exception);

    assertThat(result).isFalse();
  }

  @Test
  @DisplayName("Should retry on SendGridRequestBuildException")
  void shouldRetryOnRequestBuildException() {
    SendGridRequestBuildException exception =
        new SendGridRequestBuildException("Failed build", new RuntimeException());

    boolean result = predicate.shouldRetry(dummyMethod, exception);

    assertThat(result).isTrue();
  }

  @Test
  @DisplayName("Should not retry on generic RuntimeException")
  void shouldNotRetryOnGenericException() {
    RuntimeException exception = new RuntimeException("Other error");

    boolean result = predicate.shouldRetry(dummyMethod, exception);

    assertThat(result).isFalse();
  }
}
