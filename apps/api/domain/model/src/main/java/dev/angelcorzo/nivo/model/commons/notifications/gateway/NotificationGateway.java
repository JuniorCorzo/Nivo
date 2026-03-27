package dev.angelcorzo.nivo.model.commons.notifications.gateway;

import dev.angelcorzo.nivo.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.model.notificationtemplates.NotificationTemplates;

public interface NotificationGateway {
  void sendEmail(NotificationTemplates template, String to, NotificationsData content);
}
