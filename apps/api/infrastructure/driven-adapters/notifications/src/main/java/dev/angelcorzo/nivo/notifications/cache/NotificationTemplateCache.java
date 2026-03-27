package dev.angelcorzo.nivo.notifications.cache;

import dev.angelcorzo.nivo.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.notifications.valueobject.NotificationImmutableKey;
import java.util.Optional;

public interface NotificationTemplateCache {
  public Optional<NotificationTemplates> getTemplate(final NotificationImmutableKey key);
}
