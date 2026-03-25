package dev.angelcorzo.neoparking.usecase.notifications;

import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.neoparking.model.commons.notifications.valueobjects.UserInvitationAcceptedData;
import dev.angelcorzo.neoparking.model.commons.notifications.valueobjects.UserInvitedData;
import dev.angelcorzo.neoparking.model.commons.notifications.valueobjects.UserRoleAssignedData;
import dev.angelcorzo.neoparking.model.commons.valueobjects.AppProperties;
import dev.angelcorzo.neoparking.model.userinvitations.UserInvitations;
import dev.angelcorzo.neoparking.model.users.Users;
import dev.angelcorzo.neoparking.usecase.sendnotifications.SendNotificationsUseCase;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class DefaultUserNotifier implements UserNotifier {
  private final SendNotificationsUseCase sendNotificationsUseCase;
  private final AppProperties appProperties;

  @Override
  public void notifyUserInvited(UserInvitations invitation) {
    final UserInvitedData content =
        UserInvitedData.builder()
            .inviterName(invitation.getInvitedBy().fullName())
            .organizationName(invitation.getTenant().getCompanyName())
            .roleName(invitation.getRole().name())
            .expirationDate(
                invitation.getExpiredAt() != null ? invitation.getExpiredAt().toString() : null)
            .ctaUrl(this.appProperties.getCtaUrl())
            .companyName(this.appProperties.getCompanyName())
            .supportUrl(this.appProperties.getSupportUrl())
            .socialUrl(this.appProperties.getSocialUrl())
            .unsubscribeUrl(this.appProperties.getUnsubscribeUrl())
            .companyAddress(this.appProperties.getAddressCompany())
            .build();

    this.sendNotificationsUseCase.send(
        NotificationEvents.USER_INVITED,
        NotificationsChannel.EMAIL,
        invitation.getInvitedEmail(),
        content,
        invitation.getTenant().getId(),
        invitation.getInvitedBy().id());
  }

  @Override
  public void notifyUserInvitationAccepted(UserInvitations invitation, Users acceptedUser) {
    final UserInvitationAcceptedData content =
        UserInvitationAcceptedData.builder()
            .userName(invitation.getInvitedBy().fullName())
            .acceptedUserName(acceptedUser.getFullName())
            .organizationName(invitation.getTenant().getCompanyName())
            .roleName(invitation.getRole().name())
            .acceptedAt(
                invitation.getAcceptedAt() != null ? invitation.getAcceptedAt().toString() : null)
            .ctaUrl(this.appProperties.getCtaUrl())
            .companyName(this.appProperties.getCompanyName())
            .supportUrl(this.appProperties.getSupportUrl())
            .socialUrl(this.appProperties.getSocialUrl())
            .unsubscribeUrl(this.appProperties.getUnsubscribeUrl())
            .companyAddress(this.appProperties.getAddressCompany())
            .build();

    this.sendNotificationsUseCase.send(
        NotificationEvents.USER_INVITATION_ACCEPTED,
        NotificationsChannel.EMAIL,
        invitation.getInvitedBy().email(),
        content,
        invitation.getTenant().getId(),
        acceptedUser.getId());
  }

  @Override
  public void notifyUserRoleAssigned(Users user) {
    final UserRoleAssignedData content =
        UserRoleAssignedData.builder()
            .userName(user.getFullName())
            .roleName(user.getRole().name())
            .organizationName(user.getTenant().companyName())
            .ctaUrl(this.appProperties.getCtaUrl())
            .companyName(this.appProperties.getCompanyName())
            .supportUrl(this.appProperties.getSupportUrl())
            .socialUrl(this.appProperties.getSocialUrl())
            .unsubscribeUrl(this.appProperties.getUnsubscribeUrl())
            .companyAddress(this.appProperties.getAddressCompany())
            .build();

    this.sendNotificationsUseCase.send(
        NotificationEvents.USER_ROLE_ASSIGNED,
        NotificationsChannel.EMAIL,
        user.getEmail(),
        content,
        user.getTenant().id(),
        user.getId());
  }
}
