package dev.angelcorzo.neoparking.model.notificationlogs.gateways;

import dev.angelcorzo.neoparking.model.notificationlogs.NotificationLogs;
import java.util.List;
import java.util.UUID;

public interface NotificationLogsRepository {
  List<NotificationLogs> findAllByUserId(UUID userId);

  List<NotificationLogs> findAllByTenantId(UUID tenantId);

  NotificationLogs save(NotificationLogs notificationLogs);
}
