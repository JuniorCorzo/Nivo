package dev.angelcorzo.nivo.jpa.notificationlogs;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface NotificationLogsRepositoryData
    extends JpaRepository<NotificationLogsData, UUID> {

  @Query(
      "SELECT n FROM NotificationLogsData n WHERE n.actorUser.id = ?1 OR n.recipientUser.id = ?1")
  List<NotificationLogsData> findByUserId(UUID userId);

  List<NotificationLogsData> findByTenant_Id(UUID tenantId);
}
