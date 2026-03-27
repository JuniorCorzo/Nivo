package dev.angelcorzo.nivo.usecase.notifications;

import dev.angelcorzo.nivo.model.users.Users;

/** Generic collaborator to dispatch registration-related notifications. */
public interface RegistrationNotifier {
  void notifyUserSelfRegistered(Users notification);
}
