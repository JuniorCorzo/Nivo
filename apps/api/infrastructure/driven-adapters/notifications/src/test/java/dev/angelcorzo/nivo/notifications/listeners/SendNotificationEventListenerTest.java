package dev.angelcorzo.nivo.notifications.listeners;

import static org.mockito.Mockito.verify;

import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.commons.notifications.events.SendNotificationEvent;
import dev.angelcorzo.nivo.model.commons.notifications.valueobjects.UserInvitedData;
import dev.angelcorzo.nivo.notifications.queues.SendNotificationQueue;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("SendNotificationEventListener Unit Tests")
class SendNotificationEventListenerTest {

  @Mock private SendNotificationQueue queue;

  @InjectMocks private SendNotificationEventListener listener;

  @Test
  @DisplayName("Should enqueue received notification event")
  void shouldEnqueueEvent() {
    SendNotificationEvent event =
        SendNotificationEvent.builder()
            .event("USER_INVITED")
            .notificationEvent(NotificationEvents.USER_INVITED)
            .channel(NotificationsChannel.EMAIL)
            .tenantId(UUID.randomUUID())
            .actorUserId(UUID.randomUUID())
            .to("user@test.com")
            .content(UserInvitedData.builder().userName("John").build())
            .build();

    listener.onSendNotificationEvent(event);

    verify(queue).enqueue(event);
  }
}
