package dev.angelcorzo.nivo.usecase.acceptinvitation;

import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.userinvitations.InvitationNotFoundException;
import dev.angelcorzo.nivo.model.userinvitations.UserInvitationStatus;
import dev.angelcorzo.nivo.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.model.userinvitations.gateways.UserInvitationsRepository;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.exceptions.UserAlreadyExistsInTenantException;
import dev.angelcorzo.nivo.model.users.gateways.PasswordEncodeGateway;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.usecase.acceptinvitation.exceptions.InvitationAlreadyAcceptedException;
import dev.angelcorzo.nivo.usecase.acceptinvitation.exceptions.InvitationExpiredException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AcceptInvitationUseCaseTest {

  @Mock private UserInvitationsRepository invitationsRepository;
  @Mock private UsersRepository usersRepository;
  @Mock private PasswordEncodeGateway passwordEncode;

  @InjectMocks private AcceptInvitationUseCase useCase;

  @Test
  @DisplayName("Should create new user and accept invitation when token is valid and user is new")
  void shouldCreateNewUserAndAcceptInvitation() {
    // Given
    UUID token = UUID.randomUUID();
    UUID tenantId = UUID.randomUUID();
    Tenants tenant = Tenants.builder().id(tenantId).companyName("Test Company").build();

    UserInvitations pendingInvitation =
        UserInvitations.builder()
            .id(UUID.randomUUID())
            .invitedEmail("test@example.com")
            .tenant(tenant)
            .role(Roles.OPERATOR)
            .token(token)
            .status(UserInvitationStatus.PENDING)
            .expiredAt(OffsetDateTime.now().plusDays(3))
            .build();

    Users newUser = Users.builder().password("newStrongPassword123").fullName("Test User").build();

    when(invitationsRepository.findByToken(any())).thenReturn(Optional.of(pendingInvitation));
    when(usersRepository.existsByEmailAndTenantId("test@example.com", tenantId)).thenReturn(false);
    when(usersRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
    when(passwordEncode.encrypt(anyString())).thenReturn("encryptedPassword");

    // When
    useCase.accept(new AcceptInvitationUseCase.Accept(newUser, token));

    // Then
    ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
    verify(usersRepository).save(userCaptor.capture());
    Users savedUser = userCaptor.getValue();

    assertEquals(newUser.getFullName(), savedUser.getFullName());
    assertEquals(pendingInvitation.getInvitedEmail(), savedUser.getEmail());
    assertEquals(pendingInvitation.getTenant(), savedUser.getTenant());
    assertEquals(pendingInvitation.getRole(), savedUser.getRole());
    assertNotNull(savedUser.getPassword());

    verify(invitationsRepository).acceptedInvitation(pendingInvitation.getId());
  }

  @Test
  @DisplayName(
      "Should update user and accept invitation when token is valid and user already exists")
  void shouldUpdateUserAndAcceptInvitationWhenUserExists() {
    // Given
    UUID token = UUID.randomUUID();
    UUID tenantId = UUID.randomUUID();
    Tenants tenant = Tenants.builder().id(tenantId).companyName("Test Company").build();

    Tenants differentTenant =
        Tenants.builder().id(UUID.randomUUID()).companyName("Different Company").build();

    UserInvitations pendingInvitation =
        UserInvitations.builder()
            .id(UUID.randomUUID())
            .invitedEmail("test@example.com")
            .tenant(tenant)
            .role(Roles.OPERATOR)
            .token(token)
            .status(UserInvitationStatus.PENDING)
            .expiredAt(OffsetDateTime.now().plusDays(3))
            .build();

    Users existingUser =
        Users.builder()
            .id(UUID.randomUUID())
            .email("test@example.com")
            .fullName("Existing User")
            .password("oldPassword")
            .tenant(TenantReference.of(differentTenant))
            .role(Roles.AUDITOR)
            .build();

    when(invitationsRepository.findByToken(token)).thenReturn(Optional.of(pendingInvitation));
    when(usersRepository.existsByEmailAndTenantId("test@example.com", tenantId)).thenReturn(false);
    when(usersRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));

    // When
    useCase.accept(
        new AcceptInvitationUseCase.Accept(
            null, token)); // User details are not needed when the user exists

    // Then
    ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
    verify(usersRepository).save(userCaptor.capture());
    Users updatedUser = userCaptor.getValue();

    assertEquals(existingUser.getId(), updatedUser.getId());
    assertEquals(pendingInvitation.getTenant(), updatedUser.getTenant());
    assertEquals(pendingInvitation.getRole(), updatedUser.getRole());
    assertEquals(existingUser.getFullName(), updatedUser.getFullName()); // Name should not change

    verify(invitationsRepository).acceptedInvitation(pendingInvitation.getId());
  }

  @Test
  @DisplayName("Should throw InvitationNotFoundException when token is invalid")
  void shouldThrowExceptionForInvalidToken() {
    // Given
    UUID invalidToken = UUID.randomUUID();
    when(invitationsRepository.findByToken(invalidToken)).thenReturn(Optional.empty());

    // When & Then
    AcceptInvitationUseCase.Accept command = new AcceptInvitationUseCase.Accept(null, invalidToken);
    assertThrows(InvitationNotFoundException.class, () -> useCase.accept(command));
  }

  @Test
  @DisplayName("Should throw InvitationExpiredException when token has expired")
  void shouldThrowExceptionForExpiredToken() {
    // Given
    final UUID token = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final Tenants tenant = Tenants.builder().id(tenantId).companyName("Test Company").build();

    UserInvitations expiredInvitation =
        UserInvitations.builder()
            .status(UserInvitationStatus.PENDING)
            .tenant(tenant)
            .expiredAt(OffsetDateTime.now().minusSeconds(1)) // Expired 1 sec ago
            .build();

    when(invitationsRepository.findByToken(token)).thenReturn(Optional.of(expiredInvitation));

    // When & Then
    AcceptInvitationUseCase.Accept command = new AcceptInvitationUseCase.Accept(null, token);
    assertThrows(InvitationExpiredException.class, () -> useCase.accept(command));
  }

  @Test
  @DisplayName("Should throw InvitationAlreadyAcceptedException for an already accepted invitation")
  void shouldThrowExceptionForAlreadyAcceptedInvitation() {
    // Given
    UUID token = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final Tenants tenant = Tenants.builder().id(tenantId).companyName("Test Company").build();

    UserInvitations acceptedInvitation =
        UserInvitations.builder()
            .status(UserInvitationStatus.ACCEPTED)
            .tenant(tenant)
            .expiredAt(OffsetDateTime.now().plusDays(3))
            .build();

    when(invitationsRepository.findByToken(token)).thenReturn(Optional.of(acceptedInvitation));

    // When & Then
    AcceptInvitationUseCase.Accept command = new AcceptInvitationUseCase.Accept(null, token);
    assertThrows(InvitationAlreadyAcceptedException.class, () -> useCase.accept(command));
  }

  @Test
  @DisplayName("Should throw UserAlreadyExistsInTenantException when user is already in tenant")
  void shouldThrowExceptionWhenUserAlreadyInTenant() {
    // Given
    UUID token = UUID.randomUUID();
    UUID tenantId = UUID.randomUUID();
    Tenants tenant = Tenants.builder().id(tenantId).companyName("Test Company").build();

    UserInvitations pendingInvitation =
        UserInvitations.builder()
            .invitedEmail("test@example.com")
            .tenant(tenant)
            .status(UserInvitationStatus.PENDING)
            .expiredAt(OffsetDateTime.now().plusDays(3))
            .build();

    when(invitationsRepository.findByToken(token)).thenReturn(Optional.of(pendingInvitation));
    when(usersRepository.existsByEmailAndTenantId("test@example.com", tenantId)).thenReturn(true);

    // When & Then
    AcceptInvitationUseCase.Accept command = new AcceptInvitationUseCase.Accept(null, token);
    assertThrows(UserAlreadyExistsInTenantException.class, () -> useCase.accept(command));
  }
}
