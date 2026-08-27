package dev.angelcorzo.nivo.notifications.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationRecipientResolver Unit Tests")
class NotificationRecipientResolverTest {

  @Mock private UsersRepository usersRepository;

  @InjectMocks private NotificationRecipientResolver resolver;

  @Test
  @DisplayName("Should return actor user reference when email matches actor user email")
  void shouldReturnActorWhenEmailMatches() {
    Users actor = Users.builder().id(UUID.randomUUID()).email("actor@test.com").build();

    UserReference ref = resolver.resolve(actor, "actor@test.com", NotificationsChannel.EMAIL);

    assertThat(ref).isNotNull();
    assertThat(ref.id()).isEqualTo(actor.getId());
  }

  @Test
  @DisplayName("Should search repository when email does not match actor user")
  void shouldSearchRepositoryWhenEmailDiffers() {
    Users actor = Users.builder().id(UUID.randomUUID()).email("actor@test.com").build();
    Users recipient = Users.builder().id(UUID.randomUUID()).email("other@test.com").build();

    when(usersRepository.findByEmail("other@test.com")).thenReturn(Optional.of(recipient));

    UserReference ref = resolver.resolve(actor, "other@test.com", NotificationsChannel.EMAIL);

    assertThat(ref).isNotNull();
    assertThat(ref.id()).isEqualTo(recipient.getId());
  }

  @Test
  @DisplayName("Should return null when recipient is not found in repository")
  void shouldReturnNullWhenUserNotFound() {
    Users actor = Users.builder().id(UUID.randomUUID()).email("actor@test.com").build();

    when(usersRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

    UserReference ref = resolver.resolve(actor, "unknown@test.com", NotificationsChannel.EMAIL);

    assertThat(ref).isNull();
  }

  @Test
  @DisplayName("Should return null for WhatsApp channel")
  void shouldReturnNullForWhatsApp() {
    Users actor = Users.builder().id(UUID.randomUUID()).email("actor@test.com").build();

    UserReference ref = resolver.resolve(actor, "+573001234567", NotificationsChannel.WHATSAPP);

    assertThat(ref).isNull();
  }
}
