package dev.angelcorzo.neoparking.model.commons.notifications.gateway;

import dev.angelcorzo.neoparking.model.commons.notifications.NotificationsData;
import dev.angelcorzo.neoparking.model.notificationtemplates.NotificationTemplates;

public interface NotificationGateway {
  void sendEmail(NotificationTemplates template, String to, NotificationsData content);
}
