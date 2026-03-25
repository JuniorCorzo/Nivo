package dev.angelcorzo.neoparking.usecase.notifications;

import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.neoparking.model.commons.notifications.valueobjects.UserSelfRegisterData;
import dev.angelcorzo.neoparking.model.commons.valueobjects.AppProperties;
import dev.angelcorzo.neoparking.model.users.Users;
import dev.angelcorzo.neoparking.usecase.sendnotifications.SendNotificationsUseCase;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class DefaultRegistrationNotifier implements RegistrationNotifier {
  private final SendNotificationsUseCase sendNotificationsUseCase;
  private final AppProperties appProperties;

  @Override
  public void notifyUserSelfRegistered(Users user) {
    final UserSelfRegisterData content =
        UserSelfRegisterData.builder()
            .userName(user.getFullName())
            .email(user.getEmail())
            .companyName(user.getTenant().companyName())
            .ctaUrl(this.appProperties.getCtaUrl())
            .companyName(this.appProperties.getCompanyName())
            .companyAddress(this.appProperties.getAddressCompany())
            .socialUrl(this.appProperties.getSocialUrl())
            .unsubscribeUrl(this.appProperties.getUnsubscribeUrl())
            .build();

    this.sendNotificationsUseCase.send(
        NotificationEvents.USER_SELF_REGISTERED,
        NotificationsChannel.EMAIL,
        user.getEmail(),
        content,
        user.getTenant().id(),
        user.getId());
  }
}
