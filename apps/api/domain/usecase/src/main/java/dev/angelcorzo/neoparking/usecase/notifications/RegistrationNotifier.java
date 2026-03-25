package dev.angelcorzo.neoparking.usecase.notifications;

import dev.angelcorzo.neoparking.model.users.Users;

/** Generic collaborator to dispatch registration-related notifications. */
public interface RegistrationNotifier {
  void notifyUserSelfRegistered(Users notification);
}
