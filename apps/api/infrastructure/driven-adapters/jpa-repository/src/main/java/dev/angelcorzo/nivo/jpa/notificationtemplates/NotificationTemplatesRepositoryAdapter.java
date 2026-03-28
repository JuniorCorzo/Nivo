package dev.angelcorzo.nivo.jpa.notificationtemplates;

import dev.angelcorzo.nivo.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.jpa.notificationtemplates.mappers.NotificationTemplateMapper;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.model.notificationtemplates.gateways.NotificationTemplatesRepository;
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
