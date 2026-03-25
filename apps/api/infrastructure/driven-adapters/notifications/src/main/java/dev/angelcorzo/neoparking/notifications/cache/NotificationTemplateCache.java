package dev.angelcorzo.neoparking.notifications.cache;

import dev.angelcorzo.neoparking.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.neoparking.notifications.valueobject.NotificationImmutableKey;
import java.util.Optional;

public interface NotificationTemplateCache {
  public Optional<NotificationTemplates> getTemplate(final NotificationImmutableKey key);
}
