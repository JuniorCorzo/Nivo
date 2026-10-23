package dev.angelcorzo.nivo.infrastructure.adapter.notifications.exceptions.retrypredicates;

import dev.angelcorzo.nivo.infrastructure.adapter.notifications.exceptions.NotificationDeliveryException;
import java.lang.reflect.Method;
import org.jspecify.annotations.NonNull;
import org.springframework.resilience.retry.MethodRetryPredicate;

public class EmailExceptionPredicate implements MethodRetryPredicate {

  @Override
  public boolean shouldRetry(@NonNull Method method, @NonNull Throwable throwable) {
    return switch (throwable) {
      case NotificationDeliveryException e -> e.isRetryable();
      default -> false;
    };
  }
}
