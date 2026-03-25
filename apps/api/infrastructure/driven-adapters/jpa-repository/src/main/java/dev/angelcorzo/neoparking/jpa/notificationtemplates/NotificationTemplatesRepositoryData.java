package dev.angelcorzo.neoparking.jpa.notificationtemplates;

import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationTemplatesRepositoryData
    extends JpaRepository<NotificationTemplatesData, UUID> {

  @Query(
      "SELECT n FROM NotificationTemplatesData n WHERE n.eventType = :eventType AND n.channel ="
          + " :channel AND n.isActive = true")
  Optional<NotificationTemplatesData> findByEventTypeAndChannel(
      @Param("eventType") NotificationEvents eventType,
      @Param("channel") NotificationsChannel channel);
}
