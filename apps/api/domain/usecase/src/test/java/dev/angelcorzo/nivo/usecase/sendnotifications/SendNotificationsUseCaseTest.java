package dev.angelcorzo.nivo.usecase.sendnotifications;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.commons.events.EventBus;
import dev.angelcorzo.nivo.model.commons.notifications.NotificationsData;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.commons.notifications.events.SendNotificationEvent;
import dev.angelcorzo.nivo.model.notificationpreferences.gateways.NotificationPreferencesRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("SendNotificationsUseCase Tests")
class SendNotificationsUseCaseTest {

  private EventBus eventBus;
  private NotificationPreferencesRepository notificationPreferencesRepository;
  private SendNotificationsUseCase useCase;

  @BeforeEach
  void setUp() {
    eventBus = mock(EventBus.class);
    notificationPreferencesRepository = mock(NotificationPreferencesRepository.class);
    useCase = new SendNotificationsUseCase(eventBus, notificationPreferencesRepository);
  }

  @Test
  @DisplayName("Should send notification when event is transactional")
  void shouldSendTransactionalNotification() {
    UUID tenantId = UUID.randomUUID();
    UUID actorId = UUID.randomUUID();
    NotificationsData content = mock(NotificationsData.class);

    useCase.send(
        NotificationEvents.USER_INVITED,
        NotificationsChannel.EMAIL,
        "test@example.com",
        content,
        tenantId,
        actorId);

    verify(eventBus).publish(any(SendNotificationEvent.class));
  }

  @Test
  @DisplayName("Should send non-transactional notification when enabled in preferences")
  void shouldSendNonTransactionalNotificationWhenEnabled() {
    UUID tenantId = UUID.randomUUID();
    UUID actorId = UUID.randomUUID();
    NotificationsData content = mock(NotificationsData.class);

    when(notificationPreferencesRepository.isEnable(
            any(NotificationEvents.class), any(NotificationsChannel.class), anyString()))
        .thenReturn(true);

    useCase.send(
        NotificationEvents.TICKET_OPENED,
        NotificationsChannel.EMAIL,
        "user@example.com",
        content,
        tenantId,
        actorId);

    verify(eventBus).publish(any(SendNotificationEvent.class));
  }
}
