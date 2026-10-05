package dev.angelcorzo.nivo.domain.model.notificationpreferences.gateways;

import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.domain.model.notificationpreferences.NotificationPreferences;
import java.util.List;
import java.util.UUID;

public interface NotificationPreferencesRepository {
  List<NotificationPreferences> findAllByUserId(UUID userId);

  boolean isEnable(NotificationEvents event, NotificationsChannel channel, String to);

  boolean toggleActiveStatus(UUID userId, NotificationEvents event, NotificationsChannel channel);
}
