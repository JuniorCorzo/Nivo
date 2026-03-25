package dev.angelcorzo.neoparking.notifications.workers;

import dev.angelcorzo.neoparking.notifications.processors.NotificationProcessor;
import dev.angelcorzo.neoparking.notifications.queues.SendNotificationQueue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Background Virtual Thread worker that continuously drains the {@link SendNotificationQueue}
 * and delegates each event to the {@link NotificationProcessor}.
 *
 * <p>The worker starts a single Virtual Thread (Project Loom) on application ready. The thread
 * blocks on {@link SendNotificationQueue#take()} between events, avoiding busy-waiting.
 * Per-event exceptions are caught and logged so the loop is never aborted by a single failure.
 *
 * <p><strong>Channel coverage:</strong> this worker is channel-agnostic — it forwards every
 * {@link dev.angelcorzo.neoparking.model.commons.notifications.events.SendNotificationEvent} to the
 * processor regardless of whether it is an EMAIL or (future) WHATSAPP event. The channel-specific
 * dispatch logic lives in {@link NotificationProcessor}.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - Notifications)
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see SendNotificationQueue
 * @see NotificationProcessor
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationWorker {

  private final SendNotificationQueue queue;
  private final NotificationProcessor notificationProcessor;

  /**
   * Starts the notification event-loop Virtual Thread once the application context is fully
   * loaded and the application is ready to serve traffic.
   */
  @EventListener(ApplicationReadyEvent.class)
  public void onStartApplication() {
    log.info("Starting notification event loop worker");
    Thread.ofVirtual().name("notification-worker").start(this::startProcessingEventLoop);
  }

  /**
   * Blocking event loop that takes one event at a time from the queue and processes it.
   *
   * <p>The loop terminates cleanly on {@link InterruptedException} (e.g., during graceful
   * shutdown). All other exceptions are logged and the loop continues, ensuring a single
   * bad event does not stop notification delivery for subsequent events.
   */
  private void startProcessingEventLoop() {
    log.info("Notification event loop started");
    while (!Thread.currentThread().isInterrupted()) {
      try {
        log.debug("Waiting for notification event from queue");
        this.notificationProcessor.processEvent(queue.take());
      } catch (InterruptedException e) {
        log.warn("Notification event loop interrupted — shutting down worker");
        Thread.currentThread().interrupt();
        break;
      } catch (Exception ex) {
        log.error("Unhandled exception in notification event loop", ex);
      }
    }
    log.info("Notification event loop stopped");
  }
}
