package dev.angelcorzo.nivo.notifications.processors;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.commons.notifications.events.SendNotificationEvent;
import dev.angelcorzo.nivo.model.commons.notifications.gateway.NotificationGateway;
import dev.angelcorzo.nivo.model.commons.notifications.valueobjects.UserInvitedData;
import dev.angelcorzo.nivo.model.notificationtemplates.NotificationTemplates;
import dev.angelcorzo.nivo.notifications.cache.NotificationTemplateCache;
import dev.angelcorzo.nivo.notifications.context.NotificationExecutionContextHolder;
import dev.angelcorzo.nivo.notifications.valueobject.NotificationImmutableKey;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationProcessor Unit Tests")
class NotificationProcessorTest {

  @Mock private NotificationGateway notificationGateway;
  @Mock private NotificationTemplateCache notificationTemplatesCache;
  @Mock private NotificationExecutionContextHolder executionContextHolder;

  @InjectMocks private NotificationProcessor notificationProcessor;

  private UUID tenantId;
  private UUID actorUserId;
  private NotificationsData content;

  @BeforeEach
  void setUp() {
    tenantId = UUID.randomUUID();
    actorUserId = UUID.randomUUID();
    content = UserInvitedData.builder().userName("John").build();
  }

  @Test
  @DisplayName("Should throw IllegalStateException when execution context ids are missing")
  void shouldThrowWhenContextIdsMissing() {
    SendNotificationEvent event =
        SendNotificationEvent.builder()
            .event("USER_INVITED")
            .notificationEvent(NotificationEvents.USER_INVITED)
            .channel(NotificationsChannel.EMAIL)
            .actorUserId(actorUserId)
            .to("to@test.com")
            .content(content)
            .build();

    assertThatThrownBy(() -> notificationProcessor.processEvent(event))
        .isInstanceOf(IllegalStateException.class)
        .hasMessage("Notification event missing execution context ids");
  }

  @Test
  @DisplayName("Should process event and send email when template is cached")
  void shouldProcessEventSuccessfully() {
    SendNotificationEvent event =
        SendNotificationEvent.builder()
            .event("USER_INVITED")
            .notificationEvent(NotificationEvents.USER_INVITED)
            .channel(NotificationsChannel.EMAIL)
            .tenantId(tenantId)
            .actorUserId(actorUserId)
            .to("to@test.com")
            .content(content)
            .build();

    NotificationTemplates template =
        NotificationTemplates.builder()
            .id(UUID.randomUUID())
            .templateReference("d-123")
            .eventType(NotificationEvents.USER_INVITED)
            .channel(NotificationsChannel.EMAIL)
            .build();

    NotificationImmutableKey key =
        NotificationImmutableKey.of(NotificationEvents.USER_INVITED, NotificationsChannel.EMAIL);

    when(notificationTemplatesCache.getTemplate(key)).thenReturn(Optional.of(template));

    notificationProcessor.processEvent(event);

    verify(executionContextHolder).set(any());
    verify(notificationGateway).sendEmail(template, "to@test.com", content);
    verify(executionContextHolder).clear();
  }

  @Test
  @DisplayName("Should skip sending email when template is not found in cache")
  void shouldSkipWhenTemplateNotFound() {
    SendNotificationEvent event =
        SendNotificationEvent.builder()
            .event("USER_INVITED")
            .notificationEvent(NotificationEvents.USER_INVITED)
            .channel(NotificationsChannel.EMAIL)
            .tenantId(tenantId)
            .actorUserId(actorUserId)
            .to("to@test.com")
            .content(content)
            .build();

    NotificationImmutableKey key =
        NotificationImmutableKey.of(NotificationEvents.USER_INVITED, NotificationsChannel.EMAIL);

    when(notificationTemplatesCache.getTemplate(key)).thenReturn(Optional.empty());

    notificationProcessor.processEvent(event);

    verify(executionContextHolder).set(any());
    verify(notificationGateway, never()).sendEmail(any(), any(), any());
    verify(executionContextHolder).clear();
  }
}
