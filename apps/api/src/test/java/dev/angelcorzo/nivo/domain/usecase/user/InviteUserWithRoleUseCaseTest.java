package dev.angelcorzo.nivo.domain.usecase.user;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.commons.exceptions.ErrorMessagesModel;
import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import dev.angelcorzo.nivo.domain.model.tenants.exceptions.TenantNotExistsException;
import dev.angelcorzo.nivo.domain.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.domain.model.userinvitations.UserInvitationStatus;
import dev.angelcorzo.nivo.domain.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.domain.model.userinvitations.gateways.UserInvitationsRepository;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import dev.angelcorzo.nivo.domain.model.users.exceptions.UserAlreadyExistsInTenantException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.UserNotExistsException;
import dev.angelcorzo.nivo.domain.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.domain.usecase.notification.notifier.UserNotifier;
import dev.angelcorzo.nivo.domain.usecase.user.exceptions.InvalidRoleException;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InviteUserWithRoleUseCaseTest {
  @Mock private UsersRepository usersRepository;
  @Mock private UserInvitationsRepository userInvitationsRepository;
  @Mock private TenantsRepository tenantsRepository;
  @Mock private UserNotifier userNotifier;
  @Mock private AuthenticationContextGateway authenticationContextGateway;

  @InjectMocks private InviteUserWithRolUseCase inviteUserWithRoleUseCase;

  @Test
  @DisplayName(
      "Given valid data and a non-existing email, when registerInvitation is called, then an"
          + " invitation should be created successfully")
  void shouldCreateInvitation_whenDataIsValidAndEmailDoesNotExist() {
    // Given
    final UUID tenantId = UUID.randomUUID();
    final UUID inviteBy = UUID.randomUUID();
    final String email = "new.user@example.com";
    final Roles role = Roles.MANAGER;

    final Tenants tenant = Tenants.builder().id(tenantId).companyName("Test Company").build();

    final Users invitedByUser =
        Users.builder().id(inviteBy).fullName("Inviter User").email("inviter@example.com").build();

    final InviteUserWithRolUseCase.InviteUserWithRole inviteUserWithRole =
        InviteUserWithRolUseCase.InviteUserWithRole.builder()
            .tenantId(tenantId)
            .role(role)
            .email(email)
            .inviteBy(inviteBy)
            .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(inviteBy);
    when(usersRepository.existsByEmailAndTenantId(email, tenantId)).thenReturn(false);
    when(tenantsRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
    when(usersRepository.findById(inviteBy)).thenReturn(Optional.of(invitedByUser));
    when(userInvitationsRepository.save(any(UserInvitations.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    inviteUserWithRoleUseCase.registerInvitation(inviteUserWithRole);

    // Then
    final ArgumentCaptor<UserInvitations> invitationCaptor =
        ArgumentCaptor.forClass(UserInvitations.class);
    verify(userInvitationsRepository).save(invitationCaptor.capture());
    final UserInvitations capturedInvitation = invitationCaptor.getValue();

    assertNotNull(capturedInvitation);
    assertEquals(tenant, capturedInvitation.getTenant());
    assertEquals(tenantId, capturedInvitation.getTenant().getId());
    assertEquals(email, capturedInvitation.getInvitedEmail());
    assertEquals(role, capturedInvitation.getRole());
    assertEquals(UserInvitationStatus.PENDING, capturedInvitation.getStatus());
    assertEquals(invitedByUser.getId(), capturedInvitation.getInvitedBy().id());
    assertNotNull(capturedInvitation.getToken());
    assertNotNull(capturedInvitation.getCreatedAt());
    assertNotNull(capturedInvitation.getExpiredAt());

    final long daysBetween =
        ChronoUnit.DAYS.between(
            capturedInvitation.getCreatedAt(), capturedInvitation.getExpiredAt());
    assertEquals(3, daysBetween);

    verify(authenticationContextGateway, times(1)).getCurrentTenantId();
    verify(authenticationContextGateway, times(1)).getCurrentUserId();
    verify(usersRepository, times(1)).existsByEmailAndTenantId(email, tenantId);
    verify(tenantsRepository, times(1)).findById(tenantId);
    verify(usersRepository, times(1)).findById(inviteBy);
    verify(userInvitationsRepository, times(1)).save(any(UserInvitations.class));
    verify(userNotifier, times(1)).notifyUserInvited(any(UserInvitations.class));
  }

  @Test
  @DisplayName(
      "Given an existing email in the tenant, when registerInvitation is called, then"
          + " UserAlreadyExistsInTenantException should be thrown")
  void shouldThrowException_whenEmailAlreadyExistsInTenant() {
    // Given
    final UUID tenantId = UUID.randomUUID();
    final UUID inviteBy = UUID.randomUUID();
    final String email = "existing.user@example.com";
    final InviteUserWithRolUseCase.InviteUserWithRole inviteUserWithRole =
        InviteUserWithRolUseCase.InviteUserWithRole.builder()
            .tenantId(tenantId)
            .role(Roles.MANAGER)
            .email(email)
            .inviteBy(UUID.randomUUID())
            .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(inviteBy);
    when(usersRepository.existsByEmailAndTenantId(email, tenantId)).thenReturn(true);

    // When & Then
    final UserAlreadyExistsInTenantException exception =
        assertThrows(
            UserAlreadyExistsInTenantException.class,
            () -> inviteUserWithRoleUseCase.registerInvitation(inviteUserWithRole));

    assertEquals(
        ErrorMessagesModel.USER_ALREADY_EXISTS_IN_TENANT.format(email), exception.getMessage());
    verify(userInvitationsRepository, never()).save(any());
  }

  @Test
  @DisplayName(
      "Given a not allowed role, when registerInvitation is called, then InvalidRoleException"
          + " should be thrown")
  void shouldThrowException_whenRoleIsNotAllowed() {
    // Given
    final UUID tenantId = UUID.randomUUID();
    final UUID inviteBy = UUID.randomUUID();
    final String email = "example@email.com";
    final Roles notAllowedRole = Roles.OWNER;

    final InviteUserWithRolUseCase.InviteUserWithRole inviteUserWithRole =
        InviteUserWithRolUseCase.InviteUserWithRole.builder()
            .tenantId(tenantId)
            .role(notAllowedRole)
            .email(email)
            .inviteBy(UUID.randomUUID())
            .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(inviteBy);
    when(usersRepository.existsByEmailAndTenantId(email, tenantId)).thenReturn(false);

    // When & Then
    final InvalidRoleException exception =
        assertThrows(
            InvalidRoleException.class,
            () -> inviteUserWithRoleUseCase.registerInvitation(inviteUserWithRole));

    assertEquals(
        String.format(
            "El rol %s no esta permitido en este tipo de invitaciones",
            notAllowedRole.toString().toLowerCase()),
        exception.getMessage());
    verify(userInvitationsRepository, never()).save(any());
  }

  @Test
  @DisplayName(
      "Given a non-existing inviting user, when registerInvitation is called, then"
          + " UserNotExistsException should be thrown")
  void shouldThrowException_whenInviteByDoesNotExist() {
    // Given
    final UUID tenantId = UUID.randomUUID();
    final UUID nonExistentInviteBy = UUID.randomUUID();
    final String email = "new.user@example.com";
    final Roles role = Roles.MANAGER;
    final Tenants tenant = Tenants.builder().id(tenantId).companyName("Test Company").build();

    final InviteUserWithRolUseCase.InviteUserWithRole inviteUserWithRole =
        InviteUserWithRolUseCase.InviteUserWithRole.builder()
            .tenantId(tenantId)
            .role(role)
            .email(email)
            .inviteBy(nonExistentInviteBy)
            .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(nonExistentInviteBy);
    when(usersRepository.existsByEmailAndTenantId(email, tenantId)).thenReturn(false);
    when(tenantsRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
    when(usersRepository.findById(nonExistentInviteBy)).thenReturn(Optional.empty());

    // When & Then
    final UserNotExistsException exception =
        assertThrows(
            UserNotExistsException.class,
            () -> inviteUserWithRoleUseCase.registerInvitation(inviteUserWithRole));

    assertEquals(
        String.format("El usuario con ID %s no existe", nonExistentInviteBy),
        exception.getMessage());
    verify(userInvitationsRepository, never()).save(any(UserInvitations.class));
  }

  @Test
  @DisplayName(
      "Given a non-existing tenant, when registerInvitation is called, then"
          + " TenantNotExistsException should be thrown")
  void shouldThrowException_whenTenantDoesNotExist() {
    // Given
    final UUID tenantId = UUID.randomUUID();
    final UUID inviteBy = UUID.randomUUID();
    final String email = "new.user@example.com";
    final Roles role = Roles.MANAGER;

    final InviteUserWithRolUseCase.InviteUserWithRole inviteUserWithRole =
        InviteUserWithRolUseCase.InviteUserWithRole.builder()
            .tenantId(tenantId)
            .role(role)
            .email(email)
            .inviteBy(inviteBy)
            .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(inviteBy);
    when(usersRepository.existsByEmailAndTenantId(email, tenantId)).thenReturn(false);
    when(tenantsRepository.findById(tenantId)).thenReturn(Optional.empty());

    // When & Then
    final TenantNotExistsException exception =
        assertThrows(
            TenantNotExistsException.class,
            () -> inviteUserWithRoleUseCase.registerInvitation(inviteUserWithRole));

    assertEquals(ErrorMessagesModel.TENANT_NOT_EXISTS.format(tenantId), exception.getMessage());
    verify(userInvitationsRepository, never()).save(any(UserInvitations.class));
  }

  @Test
  @DisplayName(
      "Given a soft-deleted tenant, when registerInvitation is called, then"
          + " TenantNotExistsException should be thrown")
  void shouldThrowException_whenTenantIsSoftDeleted() {
    // Given
    final UUID tenantId = UUID.randomUUID();
    final UUID inviteBy = UUID.randomUUID();
    final String email = "new.user@example.com";
    final Roles role = Roles.MANAGER;
    final Tenants softDeletedTenant =
        Tenants.builder()
            .id(tenantId)
            .companyName("Deleted Company")
            .deletedAt(java.time.OffsetDateTime.now())
            .build();

    final InviteUserWithRolUseCase.InviteUserWithRole inviteUserWithRole =
        InviteUserWithRolUseCase.InviteUserWithRole.builder()
            .tenantId(tenantId)
            .role(role)
            .email(email)
            .inviteBy(inviteBy)
            .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(inviteBy);
    when(usersRepository.existsByEmailAndTenantId(email, tenantId)).thenReturn(false);
    when(tenantsRepository.findById(tenantId)).thenReturn(Optional.of(softDeletedTenant));

    // When & Then
    final TenantNotExistsException exception =
        assertThrows(
            TenantNotExistsException.class,
            () -> inviteUserWithRoleUseCase.registerInvitation(inviteUserWithRole));

    assertEquals(ErrorMessagesModel.TENANT_NOT_EXISTS.format(tenantId), exception.getMessage());
    verify(userInvitationsRepository, never()).save(any(UserInvitations.class));
  }

  @Test
  @DisplayName("Should use tenantId and inviteBy from AuthenticationContextGateway, ignoring command values")
  void shouldUseTenantAndInviterFromGateway_ignoringPayloadValues() {
    // Given
    final UUID contextTenantId = UUID.randomUUID();
    final UUID forgedTenantId = UUID.randomUUID();
    final UUID contextInviteBy = UUID.randomUUID();
    final UUID forgedInviteBy = UUID.randomUUID();
    final String email = "verified@example.com";
    final Roles role = Roles.OPERATOR;

    final Tenants tenant = Tenants.builder().id(contextTenantId).companyName("Context Company").build();
    final Users contextUser = Users.builder().id(contextInviteBy).fullName("Context User").email("ctx@test.com").build();

    final InviteUserWithRolUseCase.InviteUserWithRole command =
        InviteUserWithRolUseCase.InviteUserWithRole.builder()
            .tenantId(forgedTenantId)
            .inviteBy(forgedInviteBy)
            .email(email)
            .role(role)
            .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(contextTenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(contextInviteBy);
    when(usersRepository.existsByEmailAndTenantId(email, contextTenantId)).thenReturn(false);
    when(tenantsRepository.findById(contextTenantId)).thenReturn(Optional.of(tenant));
    when(usersRepository.findById(contextInviteBy)).thenReturn(Optional.of(contextUser));
    when(userInvitationsRepository.save(any(UserInvitations.class))).thenAnswer(i -> i.getArgument(0));

    // When
    final UserInvitations result = inviteUserWithRoleUseCase.registerInvitation(command);

    // Then
    assertNotNull(result);
    assertEquals(contextTenantId, result.getTenant().getId());
    assertEquals(contextInviteBy, result.getInvitedBy().id());
    verify(authenticationContextGateway, times(1)).getCurrentTenantId();
    verify(authenticationContextGateway, times(1)).getCurrentUserId();
    verify(usersRepository).existsByEmailAndTenantId(email, contextTenantId);
    verify(usersRepository, never()).existsByEmailAndTenantId(email, forgedTenantId);
    verify(tenantsRepository).findById(contextTenantId);
    verify(tenantsRepository, never()).findById(forgedTenantId);
    verify(usersRepository).findById(contextInviteBy);
    verify(usersRepository, never()).findById(forgedInviteBy);
  }
}
