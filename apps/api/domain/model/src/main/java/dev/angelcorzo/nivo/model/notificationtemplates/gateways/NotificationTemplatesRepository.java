package dev.angelcorzo.nivo.model.notificationtemplates.gateways;

import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationtemplates.NotificationTemplates;
import java.util.Optional;

public interface NotificationTemplatesRepository {
  Optional<NotificationTemplates> findByEventTypeAndChannel(
      NotificationEvents eventType, NotificationsChannel channel);
}
