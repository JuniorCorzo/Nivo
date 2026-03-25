package dev.angelcorzo.neoparking.jpa.notificationtemplates;

import dev.angelcorzo.neoparking.jpa.helper.AdapterOperations;
import dev.angelcorzo.neoparking.jpa.notificationtemplates.mappers.NotificationTemplateMapper;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.neoparking.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.neoparking.model.notificationtemplates.gateways.NotificationTemplatesRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class NotificationTemplatesRepositoryAdapter
    extends AdapterOperations<
        NotificationTemplates, NotificationTemplatesData, UUID, NotificationTemplatesRepositoryData>
    implements NotificationTemplatesRepository {

  protected NotificationTemplatesRepositoryAdapter(
      NotificationTemplatesRepositoryData repository, NotificationTemplateMapper mapper) {

    super(repository, mapper);
  }

  @Override
  public Optional<NotificationTemplates> findByEventTypeAndChannel(
      NotificationEvents eventType, NotificationsChannel channel) {
    return super.repository.findByEventTypeAndChannel(eventType, channel).map(super::toEntity);
  }
}
