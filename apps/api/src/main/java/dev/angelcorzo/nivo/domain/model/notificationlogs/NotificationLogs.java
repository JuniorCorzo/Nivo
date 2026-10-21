package dev.angelcorzo.nivo.domain.model.notificationlogs;

import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.domain.model.notificationlogs.enums.NotificationLogsStatus;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.domain.model.users.valueobject.UserReference;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
// import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
// @NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class NotificationLogs {
  private UUID id;
  private TenantReference tenant;
  private UserReference actorUser;
  private UserReference recipientUser;
  private UUID templateId;
  private NotificationEvents eventType;
  private NotificationsChannel channel;
  private String recipient;
  private String subject;
  private String body;
  private NotificationLogsStatus status;
  private String errorMessage;
  private OffsetDateTime sentAt;
  private OffsetDateTime createdAt;
}
