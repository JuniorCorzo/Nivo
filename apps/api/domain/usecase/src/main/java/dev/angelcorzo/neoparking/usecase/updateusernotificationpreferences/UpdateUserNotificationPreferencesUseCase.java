package dev.angelcorzo.neoparking.usecase.updateusernotificationpreferences;

import dev.angelcorzo.neoparking.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.neoparking.model.notificationpreferences.gateways.NotificationPreferencesRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class UpdateUserNotificationPreferencesUseCase {
  private final NotificationPreferencesRepository notificationPreferencesRepository;
  private final AuthenticationContextGateway authenticationContextGateway;

  public boolean toggleActiveStatus(NotificationEvents event, NotificationsChannel channel) {
    final UUID userId = this.authenticationContextGateway.getCurrentUserId();
    return this.notificationPreferencesRepository.toggleActiveStatus(userId, event, channel);
  }
}
