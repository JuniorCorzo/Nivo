package dev.angelcorzo.neoparking.usecase.notifications;

import dev.angelcorzo.neoparking.model.userinvitations.UserInvitations;
import dev.angelcorzo.neoparking.model.users.Users;

/** Generic collaborator to dispatch user-management-related notifications. */
public interface UserNotifier {
  void notifyUserInvited(UserInvitations invitation);

  void notifyUserInvitationAccepted(UserInvitations invitation, Users acceptedUser);

  void notifyUserRoleAssigned(Users user);
}
