package dev.angelcorzo.nivo.usecase.updateusernotificationpreferences;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationpreferences.gateways.NotificationPreferencesRepository;
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
