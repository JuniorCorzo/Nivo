package dev.angelcorzo.nivo.usecase.getnotificationpreferencesbyuser;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.notificationpreferences.NotificationPreferences;
import dev.angelcorzo.nivo.model.notificationpreferences.gateways.NotificationPreferencesRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("GetNotificationPreferencesByUserUseCase Tests")
class GetNotificationPreferencesByUserUseCaseTest {

  private NotificationPreferencesRepository notificationPreferencesRepository;
  private AuthenticationContextGateway authenticationContextGateway;
  private GetNotificationPreferencesByUserUseCase useCase;

  @BeforeEach
  void setUp() {
    notificationPreferencesRepository = mock(NotificationPreferencesRepository.class);
    authenticationContextGateway = mock(AuthenticationContextGateway.class);
    useCase = new GetNotificationPreferencesByUserUseCase(notificationPreferencesRepository, authenticationContextGateway);
  }

  @Test
  @DisplayName("Should return user notification preferences")
  void shouldReturnPreferences() {
    UUID userId = UUID.randomUUID();
    NotificationPreferences pref = NotificationPreferences.builder().id(UUID.randomUUID()).build();

    when(authenticationContextGateway.getCurrentUserId()).thenReturn(userId);
    when(notificationPreferencesRepository.findAllByUserId(userId)).thenReturn(List.of(pref));

    List<NotificationPreferences> result = useCase.execute();

    assertThat(result).hasSize(1);
    verify(notificationPreferencesRepository).findAllByUserId(userId);
  }
}
