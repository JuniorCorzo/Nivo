package dev.angelcorzo.neoparking.model.notificationtemplates.gateways;

import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.neoparking.model.notificationtemplates.NotificationTemplates;
import java.util.Optional;

public interface NotificationTemplatesRepository {
  Optional<NotificationTemplates> findByEventTypeAndChannel(
      NotificationEvents eventType, NotificationsChannel channel);
}
