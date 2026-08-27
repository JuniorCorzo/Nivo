package dev.angelcorzo.nivo.notifications.services;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationlogs.NotificationLogs;
import dev.angelcorzo.nivo.model.notificationlogs.enums.NotificationLogsStatus;
import dev.angelcorzo.nivo.model.notificationlogs.gateways.NotificationLogsRepository;
import dev.angelcorzo.nivo.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import dev.angelcorzo.nivo.notifications.context.NotificationExecutionContext;
import dev.angelcorzo.nivo.notifications.context.NotificationExecutionContextHolder;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationsLoggerService Unit Tests")
class NotificationsLoggerServiceTest {

  @Mock private NotificationLogsRepository notificationLogsRepository;
  @Mock private NotificationRecipientResolver notificationRecipientResolver;
  @Mock private NotificationExecutionContextHolder executionContextHolder;
  @Mock private TenantsRepository tenantsRepository;
  @Mock private UsersRepository usersRepository;

  @InjectMocks private NotificationsLoggerService service;

  private NotificationTemplates template;
  private UUID tenantId;
  private UUID actorUserId;
  private Tenants tenant;
  private Users user;

  @BeforeEach
  void setUp() {
    tenantId = UUID.randomUUID();
    actorUserId = UUID.randomUUID();
    template =
        NotificationTemplates.builder()
            .id(UUID.randomUUID())
            .templateReference("d-123")
            .eventType(NotificationEvents.USER_INVITED)
            .channel(NotificationsChannel.EMAIL)
            .build();

    tenant = Tenants.builder().id(tenantId).build();
    user = Users.builder().id(actorUserId).email("actor@test.com").build();

    NotificationExecutionContext context = new NotificationExecutionContext(tenantId, actorUserId);
    when(executionContextHolder.getRequired()).thenReturn(context);
    when(tenantsRepository.getReferenceById(tenantId)).thenReturn(tenant);
    when(usersRepository.getReferenceById(actorUserId)).thenReturn(user);
    when(notificationRecipientResolver.resolve(user, "recipient@test.com", NotificationsChannel.EMAIL))
        .thenReturn(UserReference.of(user));
  }

  @Test
  @DisplayName("Should register SENT log")
  void shouldRegisterSentLog() {
    service.registerLog(template, "recipient@test.com");

    verify(notificationLogsRepository).save(argThat(log -> log.getStatus() == NotificationLogsStatus.SENT));
  }

  @Test
  @DisplayName("Should register FAILED log with error message")
  void shouldRegisterFailedLog() {
    service.registerLog(template, "recipient@test.com", "SendGrid error 500");

    verify(notificationLogsRepository).save(argThat(log -> 
        log.getStatus() == NotificationLogsStatus.FAILED && "SendGrid error 500".equals(log.getErrorMessage())));
  }
}
