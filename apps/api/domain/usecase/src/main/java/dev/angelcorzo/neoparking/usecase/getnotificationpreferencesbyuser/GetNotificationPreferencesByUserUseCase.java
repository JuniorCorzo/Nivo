package dev.angelcorzo.neoparking.usecase.getnotificationpreferencesbyuser;

import dev.angelcorzo.neoparking.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.neoparking.model.notificationpreferences.NotificationPreferences;
import dev.angelcorzo.neoparking.model.notificationpreferences.gateways.NotificationPreferencesRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetNotificationPreferencesByUserUseCase {
  private final NotificationPreferencesRepository notificationPreferencesRepository;
  private final AuthenticationContextGateway authenticationContextGateway;

  public List<NotificationPreferences> execute() {
    UUID userId = authenticationContextGateway.getCurrentUserId();

    return notificationPreferencesRepository.findAllByUserId(userId);
  }
}
