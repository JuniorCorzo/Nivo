package dev.angelcorzo.nivo.usecase.deactivateuser;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.exceptions.LastOwnerCannotBeDeactivatedException;
import dev.angelcorzo.nivo.model.users.exceptions.UserAlreadyDeactivatedException;
import dev.angelcorzo.nivo.model.users.exceptions.UserNotExistsException;
import dev.angelcorzo.nivo.model.users.exceptions.UserNotExistsInTenantException;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
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
@DisplayName("DeactivateUserUseCase - Unit Tests")
class DeactivateUserUseCaseTest {

  @Mock private UsersRepository usersRepository;

  @InjectMocks private DeactivateUserUseCase deactivateUserUseCase;

  // ========== HAPPY PATH ==========

  @Test
  @DisplayName("Should deactivate non-Owner user successfully")
  void shouldDeactivateNonOwnerUser_whenAllValidationsPass() {
    // Given
    final UUID userToDeactivateId = UUID.randomUUID();
    final UUID deactivatedById = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final OffsetDateTime beforeDeactivation = OffsetDateTime.now();

    TenantReference tenant =
        TenantReference.builder().id(tenantId).companyName("Test Company").build();

    Users userToDeactivate =
        Users.builder()
            .id(userToDeactivateId)
            .email("operator@example.com")
            .fullName("Operator User")
            .role(Roles.OPERATOR)
            .tenant(tenant)
            .createdAt(OffsetDateTime.now().minusDays(10))
            .deletedAt(null) // Usuario activo
            .build();

    DeactivateUserUseCase.DeactivateUserCommand command =
        DeactivateUserUseCase.DeactivateUserCommand.builder()
            .userIdToDeactivate(userToDeactivateId)
            .deactivatedBy(deactivatedById)
            .tenantId(tenantId)
            .reason("Fin de contrato")
            .build();

    when(usersRepository.findByIdAndTenantId(userToDeactivateId, tenantId))
        .thenReturn(Optional.of(userToDeactivate));
    when(usersRepository.existsById(deactivatedById)).thenReturn(true);
    when(usersRepository.save(any(Users.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    Users result = deactivateUserUseCase.deactivate(command);

    // Then
    ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
    verify(usersRepository).save(userCaptor.capture());
    Users capturedUser = userCaptor.getValue();

    assertNotNull(capturedUser.getDeletedAt(), "deleted_at debe tener valor");
    assertTrue(
        capturedUser.getDeletedAt().isAfter(beforeDeactivation)
            || capturedUser.getDeletedAt().isEqual(beforeDeactivation),
        "deleted_at debe ser >= al momento de la operación");
    assertNotNull(capturedUser.getUpdatedAt());

    assertEquals(userToDeactivateId, result.getId());
    assertEquals(deactivatedById, result.getDeletedBy());
    assertNotNull(result.getDeletedAt());

    verify(usersRepository, times(1)).findByIdAndTenantId(userToDeactivateId, tenantId);
    verify(usersRepository, times(1)).existsById(deactivatedById);
    verify(usersRepository, times(1)).save(any(Users.class));
  }

  @Test
  @DisplayName("Should deactivate one Owner when multiple Owners exist")
  void shouldDeactivateOwner_whenMultipleOwnersExist() {
    // Given
    final UUID ownerToDeactivateId = UUID.randomUUID();
    final UUID deactivatedById = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();

    TenantReference tenant =
        TenantReference.builder().id(tenantId).companyName("Test Company").build();

    Users ownerToDeactivate =
        Users.builder()
            .id(ownerToDeactivateId)
            .email("owner1@example.com")
            .role(Roles.OWNER)
            .tenant(tenant)
            .deletedAt(null)
            .build();

    DeactivateUserUseCase.DeactivateUserCommand command =
        DeactivateUserUseCase.DeactivateUserCommand.builder()
            .userIdToDeactivate(ownerToDeactivateId)
            .deactivatedBy(deactivatedById)
            .tenantId(tenantId)
            .build();

    when(usersRepository.findByIdAndTenantId(ownerToDeactivateId, tenantId))
        .thenReturn(Optional.of(ownerToDeactivate));
    when(usersRepository.existsById(deactivatedById)).thenReturn(true);
    when(usersRepository.countActiveOwnersByTenantId(tenantId))
        .thenReturn(2L); // Existen 2 Owners activos
    when(usersRepository.save(any(Users.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    Users result = deactivateUserUseCase.deactivate(command);

    // Then
    assertNotNull(result);
    verify(usersRepository).countActiveOwnersByTenantId(tenantId);
    verify(usersRepository).save(any(Users.class));
  }

  // ========== BUSINESS RULES VALIDATION ==========

  @Test
  @DisplayName("Should reject deactivation when user is the last Owner")
  void shouldThrowException_whenDeactivatingLastOwner() {
    // Given
    final UUID lastOwnerId = UUID.randomUUID();
    final UUID deactivatedById = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final TenantReference tenant =
        TenantReference.builder().id(tenantId).companyName("Test Company").build();

    Users lastOwner =
        Users.builder()
            .id(lastOwnerId)
            .email("lastowner@example.com")
            .role(Roles.OWNER)
            .tenant(tenant)
            .deletedAt(null)
            .build();

    DeactivateUserUseCase.DeactivateUserCommand command =
        DeactivateUserUseCase.DeactivateUserCommand.builder()
            .userIdToDeactivate(lastOwnerId)
            .deactivatedBy(deactivatedById)
            .tenantId(tenantId)
            .build();

    when(usersRepository.findByIdAndTenantId(lastOwnerId, tenantId))
        .thenReturn(Optional.of(lastOwner));
    when(usersRepository.existsById(deactivatedById)).thenReturn(true);
    when(usersRepository.countActiveOwnersByTenantId(tenantId))
        .thenReturn(1L); // Solo 1 Owner activo

    // When & Then
    LastOwnerCannotBeDeactivatedException exception =
        assertThrows(
            LastOwnerCannotBeDeactivatedException.class,
            () -> deactivateUserUseCase.deactivate(command));

    assertEquals(
        ErrorMessagesModel.LAST_OWNER_CANNOT_BE_DEACTIVATED.toString(), exception.getMessage());
    verify(usersRepository, never()).save(any(Users.class));
  }

  @Test
  @DisplayName("Should reject deactivation when user is already deactivated")
  void shouldThrowException_whenUserAlreadyDeactivated() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID deactivatedById = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();

    final TenantReference tenant =
        TenantReference.builder().id(tenantId).companyName("Test Company").build();

    Users alreadyDeactivatedUser =
        Users.builder()
            .id(userId)
            .email("deactivated@example.com")
            .role(Roles.MANAGER)
            .tenant(tenant)
            .deletedAt(OffsetDateTime.now().minusDays(5)) // Ya desactivado
            .build();

    DeactivateUserUseCase.DeactivateUserCommand command =
        DeactivateUserUseCase.DeactivateUserCommand.builder()
            .userIdToDeactivate(userId)
            .deactivatedBy(deactivatedById)
            .tenantId(tenantId)
            .build();

    when(usersRepository.findByIdAndTenantId(userId, tenantId))
        .thenReturn(Optional.of(alreadyDeactivatedUser));
    when(usersRepository.existsById(deactivatedById)).thenReturn(true);

    // When & Then
    UserAlreadyDeactivatedException exception =
        assertThrows(
            UserAlreadyDeactivatedException.class, () -> deactivateUserUseCase.deactivate(command));

    assertEquals(
        ErrorMessagesModel.USER_ALREADY_DEACTIVATED.format(userId), exception.getMessage());
    verify(usersRepository, never()).save(any(Users.class));
  }

  // ========== VALIDATION ERRORS ==========

  @Test
  @DisplayName("Should throw exception when user does not exist")
  void shouldThrowException_whenUserDoesNotExist() {
    // Given
    final UUID nonExistentUserId = UUID.randomUUID();
    final UUID deactivatedById = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();

    DeactivateUserUseCase.DeactivateUserCommand command =
        DeactivateUserUseCase.DeactivateUserCommand.builder()
            .userIdToDeactivate(nonExistentUserId)
            .deactivatedBy(deactivatedById)
            .tenantId(tenantId)
            .build();

    when(usersRepository.findByIdAndTenantId(nonExistentUserId, tenantId))
        .thenReturn(Optional.empty());
    when(usersRepository.existsById(deactivatedById)).thenReturn(true);
    when(usersRepository.existsById(nonExistentUserId)).thenReturn(false);

    // When & Then
    UserNotExistsException exception =
        assertThrows(UserNotExistsException.class, () -> deactivateUserUseCase.deactivate(command));

    assertEquals(
        ErrorMessagesModel.USER_NOT_EXIST_ID.format(nonExistentUserId), exception.getMessage());
    verify(usersRepository, never()).save(any(Users.class));
  }

  @Test
  @DisplayName("Should throw exception when user exists but not in the tenant")
  void shouldThrowException_whenUserNotInTenant() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID deactivatedById = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();

    DeactivateUserUseCase.DeactivateUserCommand command =
        DeactivateUserUseCase.DeactivateUserCommand.builder()
            .userIdToDeactivate(userId)
            .deactivatedBy(deactivatedById)
            .tenantId(tenantId)
            .build();

    when(usersRepository.findByIdAndTenantId(userId, tenantId)).thenReturn(Optional.empty());
    when(usersRepository.existsById(deactivatedById))
        .thenReturn(true); // Existe pero en otro tenant
    when(usersRepository.existsById(userId)).thenReturn(true); // Existe pero en otro tenant

    // When & Then
    UserNotExistsInTenantException exception =
        assertThrows(
            UserNotExistsInTenantException.class, () -> deactivateUserUseCase.deactivate(command));

    assertEquals(
        ErrorMessagesModel.USER_NOT_EXIST_IN_TENANT.format(userId), exception.getMessage());
    verify(usersRepository, never()).save(any(Users.class));
  }

  @Test
  @DisplayName("Should throw exception when deactivatedBy user does not exist")
  void shouldThrowException_whenDeactivatedByUserDoesNotExist() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID nonExistentDeactivatorId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final TenantReference tenant =
        TenantReference.builder().id(tenantId).companyName("Test Company").build();

    Users user =
        Users.builder().id(userId).role(Roles.OPERATOR).tenant(tenant).deletedAt(null).build();

    DeactivateUserUseCase.DeactivateUserCommand command =
        DeactivateUserUseCase.DeactivateUserCommand.builder()
            .userIdToDeactivate(userId)
            .deactivatedBy(nonExistentDeactivatorId)
            .tenantId(tenantId)
            .build();

    when(usersRepository.existsById(nonExistentDeactivatorId)).thenReturn(false);

    // When & Then
    UserNotExistsException exception =
        assertThrows(UserNotExistsException.class, () -> deactivateUserUseCase.deactivate(command));

    assertEquals(
        ErrorMessagesModel.USER_NOT_EXIST_ID.format(nonExistentDeactivatorId),
        exception.getMessage());
    verify(usersRepository, never()).save(any(Users.class));
  }

  // ========== EDGE CASES ==========

  @Test
  @DisplayName("Should allow Owner to deactivate themselves when another Owner exists")
  void shouldAllowOwnerSelfDeactivation_whenAnotherOwnerExists() {
    // Given
    final UUID ownerId = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final TenantReference tenant =
        TenantReference.builder().id(tenantId).companyName("Test Company").build();

    Users owner =
        Users.builder()
            .id(ownerId)
            .email("owner@example.com")
            .role(Roles.OWNER)
            .tenant(tenant)
            .deletedAt(null)
            .build();

    DeactivateUserUseCase.DeactivateUserCommand command =
        DeactivateUserUseCase.DeactivateUserCommand.builder()
            .userIdToDeactivate(ownerId)
            .deactivatedBy(ownerId) // Autodesactivación
            .tenantId(tenantId)
            .build();

    when(usersRepository.findByIdAndTenantId(ownerId, tenantId)).thenReturn(Optional.of(owner));
    when(usersRepository.existsById(ownerId)).thenReturn(true);
    when(usersRepository.countActiveOwnersByTenantId(tenantId)).thenReturn(2L); // Hay otro Owner
    when(usersRepository.save(any(Users.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    Users result = deactivateUserUseCase.deactivate(command);

    // Then
    assertNotNull(result);
    assertEquals(ownerId, result.getId());
    assertEquals(ownerId, result.getDeletedBy());
    verify(usersRepository).save(any(Users.class));
  }

  @Test
  @DisplayName("Should update updatedAt timestamp when deactivating user")
  void shouldUpdateUpdatedAtTimestamp_whenDeactivating() {
    // Given
    final UUID userId = UUID.randomUUID();
    final UUID deactivatedById = UUID.randomUUID();
    final UUID tenantId = UUID.randomUUID();
    final OffsetDateTime originalUpdatedAt = OffsetDateTime.now().minusDays(5);
    final TenantReference tenant =
        TenantReference.builder().id(tenantId).companyName("Test Company").build();

    Users user =
        Users.builder()
            .id(userId)
            .role(Roles.DRIVER)
            .tenant(tenant)
            .updatedAt(originalUpdatedAt)
            .deletedAt(null)
            .build();

    DeactivateUserUseCase.DeactivateUserCommand command =
        DeactivateUserUseCase.DeactivateUserCommand.builder()
            .userIdToDeactivate(userId)
            .deactivatedBy(deactivatedById)
            .tenantId(tenantId)
            .build();

    when(usersRepository.findByIdAndTenantId(userId, tenantId)).thenReturn(Optional.of(user));
    when(usersRepository.existsById(deactivatedById)).thenReturn(true);
    when(usersRepository.save(any(Users.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    // When
    deactivateUserUseCase.deactivate(command);

    // Then
    ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
    verify(usersRepository).save(userCaptor.capture());
    Users capturedUser = userCaptor.getValue();

    assertNotNull(capturedUser.getUpdatedAt());
    assertTrue(
        capturedUser.getUpdatedAt().isAfter(originalUpdatedAt),
        "updatedAt debe ser posterior al valor original");
  }
}
