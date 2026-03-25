package dev.angelcorzo.neoparking.model.commons.notifications.events;

import dev.angelcorzo.neoparking.model.commons.events.Event;
import dev.angelcorzo.neoparking.model.commons.notifications.NotificationsData;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;

@Builder
public record SendNotificationEvent(
    String event,
    NotificationEvents notificationEvent,
    NotificationsChannel channel,
    UUID tenantId,
    UUID actorUserId,
    String to,
    NotificationsData content,
    LocalDateTime occurredAt)
    implements Event {

  public SendNotificationEvent {
    if (occurredAt == null) {
      occurredAt = LocalDateTime.now();
    }
  }
}
