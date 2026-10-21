package dev.angelcorzo.nivo.domain.usecase.notification.notifier;

import dev.angelcorzo.nivo.domain.model.users.Users;

/** Generic collaborator to dispatch registration-related notifications. */
public interface RegistrationNotifier {
  void notifyUserSelfRegistered(Users notification);
}
