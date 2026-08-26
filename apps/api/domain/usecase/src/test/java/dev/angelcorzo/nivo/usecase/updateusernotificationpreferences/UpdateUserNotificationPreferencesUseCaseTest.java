package dev.angelcorzo.nivo.usecase.updateusernotificationpreferences;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationpreferences.gateways.NotificationPreferencesRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("UpdateUserNotificationPreferencesUseCase Tests")
class UpdateUserNotificationPreferencesUseCaseTest {

  private NotificationPreferencesRepository notificationPreferencesRepository;
  private AuthenticationContextGateway authenticationContextGateway;
  private UpdateUserNotificationPreferencesUseCase useCase;

  @BeforeEach
  void setUp() {
    notificationPreferencesRepository = mock(NotificationPreferencesRepository.class);
    authenticationContextGateway = mock(AuthenticationContextGateway.class);
    useCase = new UpdateUserNotificationPreferencesUseCase(notificationPreferencesRepository, authenticationContextGateway);
  }

  @Test
  @DisplayName("Should toggle notification active status")
  void shouldToggleActiveStatus() {
    UUID userId = UUID.randomUUID();

    when(authenticationContextGateway.getCurrentUserId()).thenReturn(userId);
    when(notificationPreferencesRepository.toggleActiveStatus(
            userId, NotificationEvents.TICKET_CREATED, NotificationsChannel.EMAIL))
        .thenReturn(true);

    boolean result = useCase.toggleActiveStatus(NotificationEvents.TICKET_CREATED, NotificationsChannel.EMAIL);

    assertThat(result).isTrue();
    verify(notificationPreferencesRepository).toggleActiveStatus(userId, NotificationEvents.TICKET_CREATED, NotificationsChannel.EMAIL);
  }
}
