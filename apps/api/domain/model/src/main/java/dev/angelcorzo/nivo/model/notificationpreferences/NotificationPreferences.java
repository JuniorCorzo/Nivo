package dev.angelcorzo.nivo.model.notificationpreferences;

import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
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
public class NotificationPreferences {
  private UUID id;
  private UserReference user;
  private TenantReference tenant;
  private NotificationEvents eventType;
  private NotificationsChannel channel;
  private Boolean isEnabled;
  private OffsetDateTime createdAt;
  private OffsetDateTime updatedAt;
}
