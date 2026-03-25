package dev.angelcorzo.neoparking.notifications.queues;

import dev.angelcorzo.neoparking.model.commons.notifications.events.SendNotificationEvent;
import java.util.concurrent.LinkedBlockingDeque;
import org.springframework.stereotype.Component;

@Component
public class SendNotificationQueue {
  private final LinkedBlockingDeque<SendNotificationEvent> eventsQueue =
      new LinkedBlockingDeque<>();

  public void enqueue(SendNotificationEvent event) {
    eventsQueue.offer(event);
  }

  public SendNotificationEvent take() throws InterruptedException {
    return eventsQueue.take();
  }
}
