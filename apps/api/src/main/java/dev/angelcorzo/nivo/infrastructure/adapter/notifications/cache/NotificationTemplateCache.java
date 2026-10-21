package dev.angelcorzo.nivo.infrastructure.adapter.notifications.cache;

import dev.angelcorzo.nivo.domain.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.valueobject.NotificationImmutableKey;
import java.util.Optional;

public interface NotificationTemplateCache {
  public Optional<NotificationTemplates> getTemplate(final NotificationImmutableKey key);
}
