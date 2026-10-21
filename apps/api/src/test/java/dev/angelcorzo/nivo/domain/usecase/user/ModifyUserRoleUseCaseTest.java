package dev.angelcorzo.nivo.domain.usecase.user;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.commons.exceptions.ErrorMessagesModel;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import dev.angelcorzo.nivo.domain.model.users.exceptions.CannotModifyOwnerRoleException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.SelfRoleModificationNotAllowedException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.UserNotExistsInTenantException;
import dev.angelcorzo.nivo.domain.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.domain.usecase.notification.notifier.UserNotifier;
import dev.angelcorzo.nivo.domain.usecase.user.exceptions.InvalidRoleException;
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
  @Mock
  private UsersRepository usersRepository;

  @Mock
  private UserNotifier userNotifier;

  @Mock
  private AuthenticationContextGateway authenticationContextGateway;

  @InjectMocks
  private ModifyUserRoleUseCase modifyUserRoleUseCase;

  @Test
  @DisplayName("Given valid data and existing user, when modifyRole is called, then the user role should be"
    + " updated successfully")
  void shouldModifyRole_whenDataIsValidAndUserExists() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID actorId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final Roles currentRole = Roles.OPERATOR;
    final Roles newRole = Roles.MANAGER;

    final TenantReference tenant = TenantReference.builder().id(tenantId).companyName("Test Company").build();

    final Users existingUser = Users.builder()
      .id(userId)
      .email("user@example.com")
      .fullName("Test User")
      .role(currentRole)
      .tenant(tenant)
      .createdAt(OffsetDateTime.now())
      .build();

    final ModifyUserRoleUseCase.ModifyUserRole modifyUserRole = ModifyUserRoleUseCase.ModifyUserRole.builder()
      .userId(userId)
      .newRole(newRole)
      .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
    when(usersRepository.findByIdAndTenantId(userId, tenantId)).thenReturn(Optional.of(existingUser));
    when(usersRepository.save(any(Users.class)))
      .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    modifyUserRoleUseCase.modifyRole(modifyUserRole);

    // Then
    final ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
    verify(usersRepository).save(userCaptor.capture());
    final Users capturedUser = userCaptor.getValue();

    assertNotNull(capturedUser);
    assertEquals(newRole, capturedUser.getRole());
    assertEquals(userId, capturedUser.getId());
    assertEquals(tenant, capturedUser.getTenant());
    assertEquals(tenantId, capturedUser.getTenant().id());

    verify(authenticationContextGateway, times(1)).getCurrentTenantId();
    verify(authenticationContextGateway, times(1)).getCurrentUserId();
    verify(usersRepository, times(1)).findByIdAndTenantId(userId, tenantId);
    verify(usersRepository, times(1)).save(any(Users.class));
  }

  @Test
  @DisplayName("Given a non-existing user, when modifyRole is called, then UserNotExistsInTenantException"
    + " should be thrown")
  void shouldThrowException_whenUserDoesNotExist() {
    // Given
    final UUID nonExistentUserId = UUID.randomUUID();
    final UUID actorId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();

    final ModifyUserRoleUseCase.ModifyUserRole modifyUserRole = ModifyUserRoleUseCase.ModifyUserRole.builder()
      .userId(nonExistentUserId)
      .newRole(Roles.MANAGER)
      .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
    when(usersRepository.findByIdAndTenantId(nonExistentUserId, tenantId)).thenReturn(Optional.empty());

    // When & Then
    final UserNotExistsInTenantException exception = assertThrows(UserNotExistsInTenantException.class,
      () -> modifyUserRoleUseCase.modifyRole(modifyUserRole));

    assertEquals(ErrorMessagesModel.USER_NOT_EXIST_IN_TENANT.toString(), exception.getMessage());
    verify(usersRepository, never()).save(any(Users.class));
  }

  @Test
  @DisplayName("Given a not allowed role, when modifyRole is called, then InvalidRoleException should be" + " thrown")
  void shouldThrowException_whenRoleIsNotAllowed() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID actorId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final Roles notAllowedRole = Roles.OWNER;

    final TenantReference tenant = TenantReference.builder().id(tenantId).companyName("Test Company").build();

    final Users existingUser = Users.builder()
      .id(userId)
      .email("user@example.com")
      .role(Roles.OPERATOR)
      .tenant(tenant)
      .build();

    final ModifyUserRoleUseCase.ModifyUserRole modifyUserRole = ModifyUserRoleUseCase.ModifyUserRole.builder()
      .userId(userId)
      .newRole(notAllowedRole)
      .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
    when(usersRepository.findByIdAndTenantId(userId, tenantId)).thenReturn(Optional.of(existingUser));

    // When & Then
    final InvalidRoleException exception = assertThrows(InvalidRoleException.class,
      () -> modifyUserRoleUseCase.modifyRole(modifyUserRole));

    assertEquals(String.format("El rol %s no esta permitido en este tipo de invitaciones",
      notAllowedRole.toString().toLowerCase()), exception.getMessage());
    verify(usersRepository, never()).save(any(Users.class));
  }

  @Test
  @DisplayName("Given a SUPERADMIN role, when modifyRole is called, then InvalidRoleException should be" + " thrown")
  void shouldThrowException_whenRoleIsSuperadmin() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID actorId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final Roles notAllowedRole = Roles.SUPERADMIN;

    final TenantReference tenant = TenantReference.builder().id(tenantId).companyName("Test Company").build();

    final Users existingUser = Users.builder()
      .id(userId)
      .email("user@example.com")
      .role(Roles.MANAGER)
      .tenant(tenant)
      .build();

    final ModifyUserRoleUseCase.ModifyUserRole modifyUserRole = ModifyUserRoleUseCase.ModifyUserRole.builder()
      .userId(userId)
      .newRole(notAllowedRole)
      .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
    when(usersRepository.findByIdAndTenantId(userId, tenantId)).thenReturn(Optional.of(existingUser));

    // When & Then
    final InvalidRoleException exception = assertThrows(InvalidRoleException.class,
      () -> modifyUserRoleUseCase.modifyRole(modifyUserRole));

    assertEquals(String.format("El rol %s no esta permitido en este tipo de invitaciones",
      notAllowedRole.toString().toLowerCase()), exception.getMessage());
    verify(usersRepository, never()).save(any(Users.class));
  }

  @Test
  @DisplayName("Given valid data to change from DRIVER to AUDITOR, when modifyRole is called, then the role"
    + " should be updated")
  void shouldModifyRole_whenChangingFromDriverToAuditor() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID actorId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();

    final TenantReference tenant = TenantReference.builder().id(tenantId).companyName("Test Company").build();

    final Users existingUser = Users.builder()
      .id(userId)
      .email("driver@example.com")
      .role(Roles.DRIVER)
      .tenant(tenant)
      .build();

    final ModifyUserRoleUseCase.ModifyUserRole modifyUserRole = ModifyUserRoleUseCase.ModifyUserRole.builder()
      .userId(userId)
      .newRole(Roles.AUDITOR)
      .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
    when(usersRepository.findByIdAndTenantId(userId, tenantId)).thenReturn(Optional.of(existingUser));
    when(usersRepository.save(any(Users.class)))
      .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    final Users result = modifyUserRoleUseCase.modifyRole(modifyUserRole);

    // Then
    assertEquals(Roles.AUDITOR, result.getRole());
    verify(usersRepository, times(1)).save(any(Users.class));
  }

  @Test
  @DisplayName("Should throw SelfRoleModificationNotAllowedException when user attempts to modify their own role")
  void shouldThrowException_whenModifyingOwnRole() {
    // Given
    final UUID currentUserId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();

    final ModifyUserRoleUseCase.ModifyUserRole modifyUserRole = ModifyUserRoleUseCase.ModifyUserRole.builder()
      .userId(currentUserId)
      .newRole(Roles.OPERATOR)
      .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(currentUserId);

    // When & Then
    assertThrows(SelfRoleModificationNotAllowedException.class,
      () -> modifyUserRoleUseCase.modifyRole(modifyUserRole));

    verify(usersRepository, never()).findByIdAndTenantId(any(), any());
    verify(usersRepository, never()).save(any(Users.class));
  }

  @Test
  @DisplayName("Should throw CannotModifyOwnerRoleException when target user is an OWNER")
  void shouldThrowException_whenTargetUserIsOwner() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID actorId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();

    final TenantReference tenant = TenantReference.builder().id(tenantId).companyName("Test Company").build();

    final Users ownerUser = Users.builder()
      .id(userId)
      .email("owner@example.com")
      .role(Roles.OWNER)
      .tenant(tenant)
      .build();

    final ModifyUserRoleUseCase.ModifyUserRole modifyUserRole = ModifyUserRoleUseCase.ModifyUserRole.builder()
      .userId(userId)
      .newRole(Roles.MANAGER)
      .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
    when(usersRepository.findByIdAndTenantId(userId, tenantId)).thenReturn(Optional.of(ownerUser));

    // When & Then
    assertThrows(CannotModifyOwnerRoleException.class, () -> modifyUserRoleUseCase.modifyRole(modifyUserRole));

    verify(usersRepository, never()).save(any(Users.class));
  }

  @Test
  @DisplayName("Should throw CannotModifyOwnerRoleException when target user is a SUPERADMIN")
  void shouldThrowException_whenTargetUserIsSuperadmin() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID actorId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();

    final TenantReference tenant = TenantReference.builder().id(tenantId).companyName("Test Company").build();

    final Users superadminUser = Users.builder()
      .id(userId)
      .email("superadmin@example.com")
      .role(Roles.SUPERADMIN)
      .tenant(tenant)
      .build();

    final ModifyUserRoleUseCase.ModifyUserRole modifyUserRole = ModifyUserRoleUseCase.ModifyUserRole.builder()
      .userId(userId)
      .newRole(Roles.MANAGER)
      .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
    when(usersRepository.findByIdAndTenantId(userId, tenantId)).thenReturn(Optional.of(superadminUser));

    // When & Then
    assertThrows(CannotModifyOwnerRoleException.class, () -> modifyUserRoleUseCase.modifyRole(modifyUserRole));

    verify(usersRepository, never()).save(any(Users.class));
  }

  @Test
  @DisplayName("Should resolve tenantId and actorId from AuthenticationContextGateway")
  void shouldResolveTenantAndActorFromGateway() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID actorId = UUID.randomUUID();
    final UUID contextTenantId = UUID.randomUUID();

    final TenantReference tenant = TenantReference.builder()
      .id(contextTenantId)
      .companyName("Test Company")
      .build();

    final Users existingUser = Users.builder()
      .id(userId)
      .email("operator@example.com")
      .role(Roles.OPERATOR)
      .tenant(tenant)
      .build();

    final ModifyUserRoleUseCase.ModifyUserRole modifyUserRole = ModifyUserRoleUseCase.ModifyUserRole.builder()
      .userId(userId)
      .newRole(Roles.MANAGER)
      .build();

    when(authenticationContextGateway.getCurrentTenantId()).thenReturn(contextTenantId);
    when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
    when(usersRepository.findByIdAndTenantId(userId, contextTenantId)).thenReturn(Optional.of(existingUser));
    when(usersRepository.save(any(Users.class)))
      .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    modifyUserRoleUseCase.modifyRole(modifyUserRole);

    // Then
    verify(authenticationContextGateway, times(1)).getCurrentTenantId();
    verify(authenticationContextGateway, times(1)).getCurrentUserId();
    verify(usersRepository, times(1)).findByIdAndTenantId(userId, contextTenantId);
  }
}
