package dev.angelcorzo.nivo.model.commons.notifications.valueobjects;

import dev.angelcorzo.nivo.model.commons.notifications.NotificationsData;
import java.util.List;
import lombok.Builder;

@Builder
public record UserRoleAssignedData(
    String userName,
    String roleName,
    String organizationName,
    String assignedBy,
    String assignedAt,
    List<Permission> permissions,
    String ctaUrl,
    String companyName,
    String supportUrl,
    String socialUrl,
    String unsubscribeUrl,
    String companyAddress)
    implements NotificationsData {

  @Builder
  public record Permission(String name) {}
}
