package dev.angelcorzo.nivo.infrastructure.adapter.notifications.clients;

import dev.angelcorzo.nivo.domain.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.domain.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.enums.EmailProviderType;

/**
 * Strategy interface for transactional email delivery provider clients.
 */
public interface EmailProviderClient {
  EmailProviderType getProviderType();

  void sendEmail(NotificationTemplates template, String to, NotificationsData content);
}
