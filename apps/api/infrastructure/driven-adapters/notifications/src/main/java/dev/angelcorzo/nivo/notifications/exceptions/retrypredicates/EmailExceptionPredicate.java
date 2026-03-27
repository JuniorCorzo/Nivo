package dev.angelcorzo.nivo.notifications.exceptions.retrypredicates;

import dev.angelcorzo.nivo.notifications.exceptions.SendGridApiException;
import dev.angelcorzo.nivo.notifications.exceptions.SendGridRequestBuildException;
import java.lang.reflect.Method;
import org.jspecify.annotations.NonNull;
import org.springframework.resilience.retry.MethodRetryPredicate;

public class EmailExceptionPredicate implements MethodRetryPredicate {

  @Override
  public boolean shouldRetry(@NonNull Method method, @NonNull Throwable throwable) {
    return switch (throwable) {
      case SendGridApiException e -> this.manageSendGridApiException(e);
      case SendGridRequestBuildException _ -> true;
      default -> false;
    };
  }

  private boolean manageSendGridApiException(SendGridApiException ex) {
    final int statusCode = ex.getStatusCode();
    return switch (statusCode) {
      case 500, 502, 503, 504 -> true;
      default -> false;
    };
  }
}
