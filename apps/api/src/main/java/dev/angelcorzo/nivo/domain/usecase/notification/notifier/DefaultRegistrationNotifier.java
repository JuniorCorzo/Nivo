package dev.angelcorzo.nivo.domain.usecase.notification.notifier;

import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.domain.model.commons.notifications.valueobjects.UserSelfRegisterData;
import dev.angelcorzo.nivo.domain.model.commons.valueobjects.AppProperties;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.usecase.notification.SendNotificationsUseCase;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class DefaultRegistrationNotifier implements RegistrationNotifier {
  private final SendNotificationsUseCase sendNotificationsUseCase;
  private final AppProperties appProperties;

  @Override
  public void notifyUserSelfRegistered(Users user) {
    final String resolvedCompanyName = user.getTenant() != null && user.getTenant().companyName() != null
      ? user.getTenant().companyName()
      : this.appProperties.getCompanyName();

    final UserSelfRegisterData content = UserSelfRegisterData.builder()
      .userName(user.getFullName())
      .email(user.getEmail())
      .companyName(resolvedCompanyName)
      .ctaUrl(this.appProperties.getCtaUrl())
      .supportUrl(this.appProperties.getSupportUrl())
      .companyAddress(this.appProperties.getAddressCompany())
      .socialUrl(this.appProperties.getSocialUrl())
      .unsubscribeUrl(this.appProperties.getUnsubscribeUrl())
      .build();

    final UUID tenantId = user.getTenant() != null ? user.getTenant().id() : null;

    this.sendNotificationsUseCase.send(NotificationEvents.USER_SELF_REGISTERED, NotificationsChannel.EMAIL,
      user.getEmail(), content, tenantId, user.getId());
  }
}
