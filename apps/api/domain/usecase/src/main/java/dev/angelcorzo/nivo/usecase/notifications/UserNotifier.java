package dev.angelcorzo.nivo.usecase.notifications;

import dev.angelcorzo.nivo.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.model.users.Users;

/** Generic collaborator to dispatch user-management-related notifications. */
public interface UserNotifier {
  void notifyUserInvited(UserInvitations invitation);

  void notifyUserInvitationAccepted(UserInvitations invitation, Users acceptedUser);

  void notifyUserRoleAssigned(Users user);
}
