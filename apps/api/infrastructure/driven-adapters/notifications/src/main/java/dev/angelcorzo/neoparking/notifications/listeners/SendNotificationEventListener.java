package dev.angelcorzo.neoparking.notifications.listeners;

import dev.angelcorzo.neoparking.model.commons.notifications.events.SendNotificationEvent;
import dev.angelcorzo.neoparking.notifications.queues.SendNotificationQueue;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SendNotificationEventListener {
  private final SendNotificationQueue queue;

  @Async
  @EventListener
  public void onSendNotificationEvent(SendNotificationEvent event) {
    this.queue.enqueue(event);
  }
}
