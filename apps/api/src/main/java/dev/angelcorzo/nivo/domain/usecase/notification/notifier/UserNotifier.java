package dev.angelcorzo.nivo.domain.usecase.notification.notifier;

import dev.angelcorzo.nivo.domain.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.domain.model.users.Users;

/** Generic collaborator to dispatch user-management-related notifications. */
public interface UserNotifier {
  void notifyUserInvited(UserInvitations invitation);

  void notifyUserInvitationAccepted(UserInvitations invitation, Users acceptedUser);

  void notifyUserRoleAssigned(Users user);
}
