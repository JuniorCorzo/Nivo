package dev.angelcorzo.nivo.domain.usecase.notification;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.domain.model.notificationpreferences.gateways.NotificationPreferencesRepository;
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
