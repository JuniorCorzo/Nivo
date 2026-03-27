package dev.angelcorzo.nivo.notifications.services;

import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationRecipientResolver {
  private final UsersRepository usersRepository;

  public UserReference resolve(Users actorUser, String recipient, NotificationsChannel channel) {
    final Users resolvedUser =
        switch (channel) {
          case EMAIL -> this.resolveByEmail(actorUser, recipient);
          case WHATSAPP -> null;
        };

    if (resolvedUser == null) {
      return null;
    }

    return UserReference.of(resolvedUser);
  }

  private Users resolveByEmail(Users actorUser, String recipient) {
    if (actorUser.getEmail().equals(recipient)) {
      return actorUser;
    }

    return this.usersRepository.findByEmail(recipient).orElse(null);
  }
}

