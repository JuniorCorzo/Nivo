package dev.angelcorzo.neoparking.notifications.processors;

import dev.angelcorzo.neoparking.model.commons.notifications.events.SendNotificationEvent;
import dev.angelcorzo.neoparking.model.commons.notifications.gateway.NotificationGateway;
import dev.angelcorzo.neoparking.notifications.cache.NotificationTemplateCache;
import dev.angelcorzo.neoparking.notifications.context.NotificationExecutionContext;
import dev.angelcorzo.neoparking.notifications.context.NotificationExecutionContextHolder;
import dev.angelcorzo.neoparking.notifications.exceptions.SendGridRequestBuildException;
import dev.angelcorzo.neoparking.notifications.exceptions.retrypredicates.EmailExceptionPredicate;
import dev.angelcorzo.neoparking.notifications.utils.EmailMaskUtils;
import dev.angelcorzo.neoparking.notifications.valueobject.NotificationImmutableKey;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationProcessor {
  private static final int RETRY_INITIAL_DELAY_MILLIS = 500;
  private static final int RETRY_DELAY_MULTIPLIER = 2;
  private static final int RETRY_MAX_DELAY_MILLIS = 2_000;
  private final NotificationGateway notificationGateway;
  private final NotificationTemplateCache notificationTemplatesCache;
  private final NotificationExecutionContextHolder executionContextHolder;

  @Retryable(
      maxRetries = 5,
      includes = {SendGridRequestBuildException.class},
      predicate = EmailExceptionPredicate.class,
      delay = RETRY_INITIAL_DELAY_MILLIS,
      multiplier = RETRY_DELAY_MULTIPLIER,
      maxDelay = RETRY_MAX_DELAY_MILLIS)
  public void processEvent(SendNotificationEvent event) {
    if (event.tenantId() == null || event.actorUserId() == null) {
      throw new IllegalStateException("Notification event missing execution context ids");
    }

    this.executionContextHolder.set(
        new NotificationExecutionContext(event.tenantId(), event.actorUserId()));

    final String maskedTo = EmailMaskUtils.mask(event.to());
    try {
      log.info(
          "Processing notification event. eventType={}, channel={}, to={}",
          event.notificationEvent(),
          event.channel(),
          maskedTo);

      final NotificationImmutableKey key =
          NotificationImmutableKey.of(event.notificationEvent(), event.channel());

      this.notificationTemplatesCache
          .getTemplate(key)
          .ifPresent(
              template -> {
                log.debug("Template cache hit for key={}", key);
                log.debug(
                    "Sending email using templateReference={} to={}",
                    template.getTemplateReference(),
                    maskedTo);

                this.notificationGateway.sendEmail(template, event.to(), event.content());
              });
    } finally {
      this.executionContextHolder.clear();
    }
  }
}
