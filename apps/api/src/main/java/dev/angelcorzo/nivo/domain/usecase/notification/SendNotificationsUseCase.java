package dev.angelcorzo.nivo.domain.usecase.notification;

import dev.angelcorzo.nivo.domain.model.commons.events.EventBus;
import dev.angelcorzo.nivo.domain.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.domain.model.commons.notifications.events.SendNotificationEvent;
import dev.angelcorzo.nivo.domain.model.notificationpreferences.gateways.NotificationPreferencesRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class SendNotificationsUseCase {
  private final EventBus eventBus;
  private final NotificationPreferencesRepository notificationPreferencesRepository;

  public void send(
      NotificationEvents event,
      NotificationsChannel channel,
      String to,
      NotificationsData content,
      UUID tenantId,
      UUID actorUserId) {
    if (!event.isTransactional()
        && !this.notificationPreferencesRepository.isEnable(event, channel, to)) {
      return;
    }

    eventBus.publish(
        SendNotificationEvent.builder()
            .event(SendNotificationEvent.class.getSimpleName())
            .channel(channel)
            .notificationEvent(event)
            .content(content)
            .tenantId(tenantId)
            .actorUserId(actorUserId)
            .to(to)
            .build());
  }
}
