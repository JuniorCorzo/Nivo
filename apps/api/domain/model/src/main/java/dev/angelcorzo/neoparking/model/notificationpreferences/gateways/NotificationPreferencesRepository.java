package dev.angelcorzo.neoparking.model.notificationpreferences.gateways;

import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.neoparking.model.notificationpreferences.NotificationPreferences;
import java.util.List;
import java.util.UUID;

public interface NotificationPreferencesRepository {
  List<NotificationPreferences> findAllByUserId(UUID userId);

  boolean isEnable(NotificationEvents event, NotificationsChannel channel, String to);

  boolean toggleActiveStatus(UUID userId, NotificationEvents event, NotificationsChannel channel);
}
