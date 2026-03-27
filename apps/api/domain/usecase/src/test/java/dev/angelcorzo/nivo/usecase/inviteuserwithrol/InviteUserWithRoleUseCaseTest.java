package dev.angelcorzo.nivo.usecase.inviteuserwithrol;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.exceptions.TenantNotExistsException;
import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.model.userinvitations.UserInvitationStatus;
import dev.angelcorzo.nivo.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.model.userinvitations.gateways.UserInvitationsRepository;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.exceptions.UserAlreadyExistsInTenantException;
import dev.angelcorzo.nivo.model.users.exceptions.UserNotExistsException;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.usecase.acceptinvitation.exceptions.InvalidRoleException;
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

    InviteUserWithRolUseCase.InviteUserWithRole inviteUserWithRole =
        InviteUserWithRolUseCase.InviteUserWithRole.builder()
            .tenantId(tenantId)
            .role(role)
            .email(email)
            .inviteBy(inviteBy)
            .build();

    when(usersRepository.existsByEmailAndTenantId(email, tenantId)).thenReturn(false);
    when(usersRepository.existsById(inviteBy)).thenReturn(true);
    when(tenantsRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
    when(usersRepository.findById(inviteBy)).thenReturn(Optional.of(invitedByUser));
    when(userInvitationsRepository.save(any(UserInvitations.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    inviteUserWithRoleUseCase.registerInvitation(inviteUserWithRole);

    // Then
    ArgumentCaptor<UserInvitations> invitationCaptor =
        ArgumentCaptor.forClass(UserInvitations.class);
    verify(userInvitationsRepository).save(invitationCaptor.capture());
    UserInvitations capturedInvitation = invitationCaptor.getValue();

    assertNotNull(capturedInvitation);
    assertEquals(tenant, capturedInvitation.getTenant());
    assertEquals(tenantId, capturedInvitation.getTenant().getId());
    assertEquals(email, capturedInvitation.getInvitedEmail());
    assertEquals(role, capturedInvitation.getRole());
    assertEquals(UserInvitationStatus.PENDING, capturedInvitation.getStatus());
    assertEquals(invitedByUser, capturedInvitation.getInvitedBy());
    assertNotNull(capturedInvitation.getToken());
    assertNotNull(capturedInvitation.getCreatedAt());
    assertNotNull(capturedInvitation.getExpiredAt());

    long daysBetween =
        ChronoUnit.DAYS.between(
            capturedInvitation.getCreatedAt(), capturedInvitation.getExpiredAt());
    assertEquals(3, daysBetween);

    verify(usersRepository, times(1)).existsByEmailAndTenantId(email, tenantId);
    verify(usersRepository, times(1)).existsById(inviteBy);
    verify(tenantsRepository, times(1)).findById(tenantId);
    verify(usersRepository, times(1)).findById(inviteBy);
    verify(userInvitationsRepository, times(1)).save(any(UserInvitations.class));
  }

  @Test
  @DisplayName(
      "Given an existing email in the tenant, when registerInvitation is called, then"
          + " UserAlreadyExistsInTenantException should be thrown")
  void shouldThrowException_whenEmailAlreadyExistsInTenant() {
    // Given
    final UUID tenantId = UUID.randomUUID();
    final String email = "existing.user@example.com";
    InviteUserWithRolUseCase.InviteUserWithRole inviteUserWithRole =
        InviteUserWithRolUseCase.InviteUserWithRole.builder()
            .tenantId(tenantId)
            .role(Roles.MANAGER)
            .email(email)
            .inviteBy(UUID.randomUUID())
            .build();

    when(usersRepository.existsByEmailAndTenantId(email, tenantId)).thenReturn(true);

    // When & Then
    UserAlreadyExistsInTenantException exception =
        assertThrows(
            UserAlreadyExistsInTenantException.class,
            () -> {
              inviteUserWithRoleUseCase.registerInvitation(inviteUserWithRole);
            });

    assertEquals(
        String.format("El usuario %s ya existe en el tenant", email), exception.getMessage());
    verify(userInvitationsRepository, never()).save(any());
  }

  @Test
  @DisplayName(
      "Given a not allowed role, when registerInvitation is called, then InvalidRoleException"
          + " should be thrown")
  void shouldThrowException_whenRoleIsNotAllowed() {
    // Given
    final UUID tenantId = UUID.randomUUID();
    final String email = "example@email.com";
    final Roles notAllowedRole = Roles.OWNER;

    InviteUserWithRolUseCase.InviteUserWithRole inviteUserWithRole =
        InviteUserWithRolUseCase.InviteUserWithRole.builder()
            .tenantId(tenantId)
            .role(notAllowedRole)
            .email(email)
            .inviteBy(UUID.randomUUID())
            .build();

    when(usersRepository.existsByEmailAndTenantId(email, tenantId)).thenReturn(false);

    // When & Then
    InvalidRoleException exception =
        assertThrows(
            InvalidRoleException.class,
            () -> {
              inviteUserWithRoleUseCase.registerInvitation(inviteUserWithRole);
            });

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

    InviteUserWithRolUseCase.InviteUserWithRole inviteUserWithRole =
        InviteUserWithRolUseCase.InviteUserWithRole.builder()
            .tenantId(tenantId)
            .role(role)
            .email(email)
            .inviteBy(nonExistentInviteBy)
            .build();

    when(usersRepository.existsByEmailAndTenantId(email, tenantId)).thenReturn(false);
    when(usersRepository.existsById(nonExistentInviteBy)).thenReturn(true);
    when(tenantsRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

    // When & Then
    UserNotExistsException exception =
        assertThrows(
            UserNotExistsException.class,
            () -> {
              inviteUserWithRoleUseCase.registerInvitation(inviteUserWithRole);
            });

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

    InviteUserWithRolUseCase.InviteUserWithRole inviteUserWithRole =
        InviteUserWithRolUseCase.InviteUserWithRole.builder()
            .tenantId(tenantId)
            .role(role)
            .email(email)
            .inviteBy(inviteBy)
            .build();

    when(usersRepository.existsByEmailAndTenantId(email, tenantId)).thenReturn(false);
    when(usersRepository.existsById(inviteBy)).thenReturn(true);
    when(tenantsRepository.findById(tenantId)).thenReturn(Optional.empty());

    // When & Then
    TenantNotExistsException exception =
        assertThrows(
            TenantNotExistsException.class,
            () -> inviteUserWithRoleUseCase.registerInvitation(inviteUserWithRole));

    assertEquals(ErrorMessagesModel.TENANT_NOT_EXISTS.format(tenantId), exception.getMessage());
    verify(userInvitationsRepository, never()).save(any(UserInvitations.class));
  }
}
