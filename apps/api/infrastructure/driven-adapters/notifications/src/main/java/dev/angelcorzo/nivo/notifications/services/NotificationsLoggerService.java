package dev.angelcorzo.nivo.notifications.services;

import dev.angelcorzo.nivo.model.notificationlogs.NotificationLogs;
import dev.angelcorzo.nivo.model.notificationlogs.enums.NotificationLogsStatus;
import dev.angelcorzo.nivo.model.notificationlogs.gateways.NotificationLogsRepository;
import dev.angelcorzo.nivo.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import dev.angelcorzo.nivo.notifications.context.NotificationExecutionContext;
import dev.angelcorzo.nivo.notifications.context.NotificationExecutionContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationsLoggerService {
  private final NotificationLogsRepository notificationLogsRepository;
  private final NotificationRecipientResolver notificationRecipientResolver;
  private final NotificationExecutionContextHolder executionContextHolder;
  private final TenantsRepository tenantsRepository;
  private final UsersRepository usersRepository;

  public void registerLog(NotificationTemplates template, String to) {
    final NotificationLogs log =
        this.buildNotificationLogsBuilder(template, to, NotificationLogsStatus.SENT).build();

    this.notificationLogsRepository.save(log);
  }

  public void registerLog(NotificationTemplates template, String to, String errorMessage) {
    final NotificationLogs notificationLogs =
        this.buildNotificationLogsBuilder(template, to, NotificationLogsStatus.FAILED)
            .errorMessage(errorMessage)
            .build();

    this.notificationLogsRepository.save(notificationLogs);
  }

  private NotificationLogs.NotificationLogsBuilder buildNotificationLogsBuilder(
      NotificationTemplates template, String to, NotificationLogsStatus status) {
    final NotificationExecutionContext context = this.executionContextHolder.getRequired();
    final Tenants currentTenant = this.tenantsRepository.getReferenceById(context.tenantId());
    final Users currentUser = this.usersRepository.getReferenceById(context.actorUserId());

    return NotificationLogs.builder()
        .tenant(TenantReference.of(currentTenant))
        .actorUser(UserReference.of(currentUser))
        .recipientUser(
            this.notificationRecipientResolver.resolve(currentUser, to, template.getChannel()))
        .templateId(template.getId())
        .eventType(template.getEventType())
        .channel(template.getChannel())
        .recipient(to)
        .status(status);
  }
}
