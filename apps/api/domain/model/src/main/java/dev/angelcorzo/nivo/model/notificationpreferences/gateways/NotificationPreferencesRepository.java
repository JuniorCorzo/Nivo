package dev.angelcorzo.nivo.model.notificationpreferences.gateways;

import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationpreferences.NotificationPreferences;
import java.util.List;
import java.util.UUID;

public interface NotificationPreferencesRepository {
  List<NotificationPreferences> findAllByUserId(UUID userId);

  boolean isEnable(NotificationEvents event, NotificationsChannel channel, String to);

  boolean toggleActiveStatus(UUID userId, NotificationEvents event, NotificationsChannel channel);
}
