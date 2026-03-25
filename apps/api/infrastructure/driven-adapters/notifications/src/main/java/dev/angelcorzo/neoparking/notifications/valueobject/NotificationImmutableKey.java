package dev.angelcorzo.neoparking.notifications.valueobject;

import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;

public record NotificationImmutableKey(NotificationEvents event, NotificationsChannel channel) {
  public static NotificationImmutableKey of(
      NotificationEvents event, NotificationsChannel channel) {
    return new NotificationImmutableKey(event, channel);
  }
}
