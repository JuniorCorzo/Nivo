package dev.angelcorzo.nivo.infrastructure.adapter.notifications.services;

import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.domain.model.notificationlogs.NotificationLogs;
import dev.angelcorzo.nivo.domain.model.notificationlogs.enums.NotificationLogsStatus;
import dev.angelcorzo.nivo.domain.model.notificationlogs.gateways.NotificationLogsRepository;
import dev.angelcorzo.nivo.domain.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import dev.angelcorzo.nivo.domain.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.domain.model.users.valueobject.UserReference;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.context.NotificationExecutionContext;
import dev.angelcorzo.nivo.infrastructure.adapter.notifications.context.NotificationExecutionContextHolder;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationsLoggerService {
  private final NotificationLogsRepository notificationLogsRepository;
  private final NotificationRecipientResolver notificationRecipientResolver;
  private final NotificationExecutionContextHolder executionContextHolder;
  private final TenantsRepository tenantsRepository;
  private final UsersRepository usersRepository;

  public void registerLog(NotificationTemplates template, String to) {
    Objects.requireNonNull(template, "Notification template is required to register log");
    final NotificationLogs log = this.buildNotificationLogsBuilder(template, to, NotificationLogsStatus.SENT)
      .build();

    this.notificationLogsRepository.save(log);
  }

  public void registerLog(NotificationTemplates template, String to, String errorMessage) {
    Objects.requireNonNull(template, "Notification template is required to register failed log");
    final NotificationLogs notificationLogs = this
      .buildNotificationLogsBuilder(template, to, NotificationLogsStatus.FAILED)
      .errorMessage(errorMessage)
      .build();

    this.notificationLogsRepository.save(notificationLogs);
  }

  private NotificationLogs.NotificationLogsBuilder buildNotificationLogsBuilder(NotificationTemplates template,
    String to, NotificationLogsStatus status) {
    final NotificationExecutionContext context = this.executionContextHolder.getRequired();
    final Tenants currentTenant = this.tenantsRepository.getReferenceById(context.tenantId());
    final Users currentUser = Optional.ofNullable(context.actorUserId())
      .map(this.usersRepository::getReferenceById)
      .orElse(null);

    final NotificationsChannel channel = template.getChannel();
    final UUID templateId = template.getId();
    final NotificationEvents eventType = template.getEventType();

    return NotificationLogs.builder()
      .tenant(TenantReference.of(currentTenant))
      .actorUser(Optional.ofNullable(currentUser).map(UserReference::of).orElse(null))
      .recipientUser(this.notificationRecipientResolver.resolve(currentUser, to, channel))
      .templateId(templateId)
      .eventType(eventType)
      .channel(channel)
      .recipient(to)
      .status(status);
  }
}
