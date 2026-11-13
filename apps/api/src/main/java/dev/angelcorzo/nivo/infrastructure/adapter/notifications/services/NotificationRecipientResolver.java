package dev.angelcorzo.nivo.infrastructure.adapter.notifications.services;

import dev.angelcorzo.nivo.domain.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.domain.model.users.valueobject.UserReference;
import java.util.Optional;
import java.util.function.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationRecipientResolver {
  private final UsersRepository usersRepository;

  public UserReference resolve(Users actorUser, String recipient, NotificationsChannel channel) {
    return Optional.ofNullable(channel)
      .filter(NotificationsChannel.EMAIL::equals)
      .flatMap(ch -> this.resolveByEmail(actorUser, recipient))
      .map(UserReference::of)
      .orElse(null);
  }

  private Optional<Users> resolveByEmail(Users actorUser, String recipient) {
    return Optional.ofNullable(actorUser)
      .map(Users::getEmail)
      .filter(email -> email.equalsIgnoreCase(recipient))
      .map(ignored -> actorUser)
      .or(() -> Optional.ofNullable(recipient)
        .filter(Predicate.not(String::isBlank))
        .flatMap(this.usersRepository::findByEmail));
  }
}
