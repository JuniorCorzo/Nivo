package dev.angelcorzo.nivo.notifications.context;

import org.springframework.stereotype.Component;

@Component
public class NotificationExecutionContextHolder {
  private static final ThreadLocal<NotificationExecutionContext> CONTEXT = new ThreadLocal<>();

  public void set(NotificationExecutionContext context) {
    CONTEXT.set(context);
  }

  public NotificationExecutionContext getRequired() {
    final NotificationExecutionContext context = CONTEXT.get();
    if (context == null) {
      throw new IllegalStateException("Notification execution context is not available");
    }

    return context;
  }

  public void clear() {
    CONTEXT.remove();
  }
}

