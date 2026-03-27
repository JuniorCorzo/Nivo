package dev.angelcorzo.nivo.usecase.modifyuserrole;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.exceptions.UserNotExistsInTenantException;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.usecase.acceptinvitation.exceptions.InvalidRoleException;
import java.time.OffsetDateTime;
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
class ModifyUserRoleUseCaseTest {
  @Mock private UsersRepository usersRepository;

  @InjectMocks private ModifyUserRoleUseCase modifyUserRoleUseCase;

  @Test
  @DisplayName(
      "Given valid data and existing user, when modifyRole is called, then the user role should be"
          + " updated successfully")
  void shouldModifyRole_whenDataIsValidAndUserExists() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final Roles currentRole = Roles.OPERATOR;
    final Roles newRole = Roles.MANAGER;

    TenantReference tenant =
        TenantReference.builder().id(tenantId).companyName("Test Company").build();

    Users existingUser =
        Users.builder()
            .id(userId)
            .email("user@example.com")
            .fullName("Test User")
            .role(currentRole)
            .tenant(tenant)
            .createdAt(OffsetDateTime.now())
            .build();

    ModifyUserRoleUseCase.ModifyUserRole modifyUserRole =
        ModifyUserRoleUseCase.ModifyUserRole.builder()
            .userId(userId)
            .newRole(newRole)
            .tenantId(tenantId)
            .build();

    when(usersRepository.findByIdAndTenantId(userId, tenantId))
        .thenReturn(Optional.of(existingUser));
    when(usersRepository.save(any(Users.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    modifyUserRoleUseCase.modifyRole(modifyUserRole);

    // Then
    ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
    verify(usersRepository).save(userCaptor.capture());
    Users capturedUser = userCaptor.getValue();

    assertNotNull(capturedUser);
    assertEquals(newRole, capturedUser.getRole());
    assertEquals(userId, capturedUser.getId());
    assertEquals(tenant, capturedUser.getTenant());
    assertEquals(tenantId, capturedUser.getTenant().id());

    verify(usersRepository, times(1)).findByIdAndTenantId(userId, tenantId);
    verify(usersRepository, times(1)).save(any(Users.class));
  }

  @Test
  @DisplayName(
      "Given a non-existing user, when modifyRole is called, then UserNotExistsInTenantException"
          + " should be thrown")
  void shouldThrowException_whenUserDoesNotExist() {
    // Given
    final UUID nonExistentUserId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();

    ModifyUserRoleUseCase.ModifyUserRole modifyUserRole =
        ModifyUserRoleUseCase.ModifyUserRole.builder()
            .userId(nonExistentUserId)
            .newRole(Roles.MANAGER)
            .tenantId(tenantId)
            .build();

    when(usersRepository.findByIdAndTenantId(nonExistentUserId, tenantId))
        .thenReturn(Optional.empty());

    // When & Then
    UserNotExistsInTenantException exception =
        assertThrows(
            UserNotExistsInTenantException.class,
            () -> {
              modifyUserRoleUseCase.modifyRole(modifyUserRole);
            });

    assertEquals(ErrorMessagesModel.USER_NOT_EXIST_IN_TENANT.toString(), exception.getMessage());
    verify(usersRepository, never()).save(any(Users.class));
  }

  @Test
  @DisplayName(
      "Given a not allowed role, when modifyRole is called, then InvalidRoleException should be"
          + " thrown")
  void shouldThrowException_whenRoleIsNotAllowed() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final Roles notAllowedRole = Roles.OWNER;

    TenantReference tenant =
        TenantReference.builder().id(tenantId).companyName("Test Company").build();

    Users existingUser =
        Users.builder()
            .id(userId)
            .email("user@example.com")
            .role(Roles.OPERATOR)
            .tenant(tenant)
            .build();

    ModifyUserRoleUseCase.ModifyUserRole modifyUserRole =
        ModifyUserRoleUseCase.ModifyUserRole.builder()
            .userId(userId)
            .newRole(notAllowedRole)
            .tenantId(tenantId)
            .build();

    when(usersRepository.findByIdAndTenantId(userId, tenantId))
        .thenReturn(Optional.of(existingUser));

    // When & Then
    InvalidRoleException exception =
        assertThrows(
            InvalidRoleException.class,
            () -> {
              modifyUserRoleUseCase.modifyRole(modifyUserRole);
            });

    assertEquals(
        String.format(
            "El rol %s no esta permitido en este tipo de invitaciones",
            notAllowedRole.toString().toLowerCase()),
        exception.getMessage());
    verify(usersRepository, never()).save(any(Users.class));
  }

  @Test
  @DisplayName(
      "Given a SUPERADMIN role, when modifyRole is called, then InvalidRoleException should be"
          + " thrown")
  void shouldThrowException_whenRoleIsSuperadmin() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final Roles notAllowedRole = Roles.SUPERADMIN;

    TenantReference tenant =
        TenantReference.builder().id(tenantId).companyName("Test Company").build();

    Users existingUser =
        Users.builder()
            .id(userId)
            .email("user@example.com")
            .role(Roles.MANAGER)
            .tenant(tenant)
            .build();

    ModifyUserRoleUseCase.ModifyUserRole modifyUserRole =
        ModifyUserRoleUseCase.ModifyUserRole.builder()
            .userId(userId)
            .newRole(notAllowedRole)
            .tenantId(tenantId)
            .build();

    when(usersRepository.findByIdAndTenantId(userId, tenantId))
        .thenReturn(Optional.of(existingUser));

    // When & Then
    InvalidRoleException exception =
        assertThrows(
            InvalidRoleException.class,
            () -> {
              modifyUserRoleUseCase.modifyRole(modifyUserRole);
            });

    assertEquals(
        String.format(
            "El rol %s no esta permitido en este tipo de invitaciones",
            notAllowedRole.toString().toLowerCase()),
        exception.getMessage());
    verify(usersRepository, never()).save(any(Users.class));
  }

  @Test
  @DisplayName(
      "Given valid data to change from DRIVER to AUDITOR, when modifyRole is called, then the role"
          + " should be updated")
  void shouldModifyRole_whenChangingFromDriverToAuditor() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();

    TenantReference tenant =
        TenantReference.builder().id(tenantId).companyName("Test Company").build();

    Users existingUser =
        Users.builder()
            .id(userId)
            .email("driver@example.com")
            .role(Roles.DRIVER)
            .tenant(tenant)
            .build();

    ModifyUserRoleUseCase.ModifyUserRole modifyUserRole =
        ModifyUserRoleUseCase.ModifyUserRole.builder()
            .userId(userId)
            .newRole(Roles.AUDITOR)
            .tenantId(tenantId)
            .build();

    when(usersRepository.findByIdAndTenantId(userId, tenantId))
        .thenReturn(Optional.of(existingUser));
    when(usersRepository.save(any(Users.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    Users result = modifyUserRoleUseCase.modifyRole(modifyUserRole);

    // Then
    assertEquals(Roles.AUDITOR, result.getRole());
    verify(usersRepository, times(1)).save(any(Users.class));
  }
}
