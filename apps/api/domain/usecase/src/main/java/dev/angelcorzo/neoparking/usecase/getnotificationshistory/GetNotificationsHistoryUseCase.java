package dev.angelcorzo.neoparking.usecase.getnotificationshistory;

import dev.angelcorzo.neoparking.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.neoparking.model.notificationlogs.NotificationLogs;
import dev.angelcorzo.neoparking.model.notificationlogs.gateways.NotificationLogsRepository;
import dev.angelcorzo.neoparking.model.users.Users;
import dev.angelcorzo.neoparking.model.users.enums.Roles;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetNotificationsHistoryUseCase {
  private static final Set<Roles> ROLES_WITH_LIMITED_TENANT_NOTIFICATION_ACCESS =
      Set.of(Roles.DRIVER, Roles.OPERATOR);

  private final NotificationLogsRepository notificationLogsRepository;
  private final AuthenticationContextGateway authenticationContext;

  public List<NotificationLogs> execute() {
    final Users user = this.authenticationContext.getCurrentUser();
    final boolean isRestrictedRole =
        GetNotificationsHistoryUseCase.ROLES_WITH_LIMITED_TENANT_NOTIFICATION_ACCESS.contains(
            user.getRole());

    if (isRestrictedRole) {
      return this.notificationLogsRepository.findAllByUserId(user.getId());
    }

    final UUID tenantId = this.authenticationContext.getCurrentTenantId();
    return this.notificationLogsRepository.findAllByTenantId(tenantId);
  }
}
