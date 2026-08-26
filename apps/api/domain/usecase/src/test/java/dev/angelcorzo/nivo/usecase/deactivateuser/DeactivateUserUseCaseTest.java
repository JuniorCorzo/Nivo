package dev.angelcorzo.nivo.usecase.deactivateuser;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.exceptions.LastOwnerCannotBeDeactivatedException;
import dev.angelcorzo.nivo.model.users.exceptions.UserAlreadyDeactivatedException;
import dev.angelcorzo.nivo.model.users.exceptions.UserNotExistsInTenantException;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("DeactivateUserUseCase Tests")
class DeactivateUserUseCaseTest {

  @Mock private UsersRepository usersRepository;

  @InjectMocks private DeactivateUserUseCase deactivateUserUseCase;

  @Nested
  @DisplayName("Happy Path")
  class HappyPath {

    @Test
    @DisplayName("Should deactivate non-Owner user successfully")
    void shouldDeactivateNonOwnerUserSuccessfully() {
      // Arrange
      UUID userToDeactivateId = UUID.randomUUID();
      UUID deactivatedById = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();

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
              .deletedAt(null)
              .build();

      DeactivateUserUseCase.DeactivateUserCommand command =
          DeactivateUserUseCase.DeactivateUserCommand.builder()
              .userIdToDeactivate(userToDeactivateId)
              .deactivatedBy(deactivatedById)
              .tenantId(tenantId)
              .reason("Contract ended")
              .build();

      when(usersRepository.findByIdAndTenantId(userToDeactivateId, tenantId))
          .thenReturn(Optional.of(userToDeactivate));
      when(usersRepository.save(any(Users.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      // Act
      Users result = deactivateUserUseCase.deactivate(command);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getId()).isEqualTo(userToDeactivateId);
      assertThat(result.getDeletedBy()).isEqualTo(deactivatedById);
      assertThat(result.getDeletedAt()).isNotNull();

      ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
      verify(usersRepository).save(userCaptor.capture());
      assertThat(userCaptor.getValue().getDeletedBy()).isEqualTo(deactivatedById);
    }

    @Test
    @DisplayName("Should deactivate Owner when multiple Owners exist in tenant")
    void shouldDeactivateOwnerWhenMultipleOwnersExist() {
      // Arrange
      UUID ownerToDeactivateId = UUID.randomUUID();
      UUID deactivatedById = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();

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
      when(usersRepository.countActiveOwnersByTenantId(tenantId)).thenReturn(2L);
      when(usersRepository.save(any(Users.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      // Act
      Users result = deactivateUserUseCase.deactivate(command);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getDeletedAt()).isNotNull();
      verify(usersRepository).countActiveOwnersByTenantId(tenantId);
      verify(usersRepository).save(any(Users.class));
    }

    @Test
    @DisplayName("Should allow Owner self-deactivation when another Owner exists")
    void shouldAllowOwnerSelfDeactivation() {
      // Arrange
      UUID ownerId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      TenantReference tenant =
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
              .deactivatedBy(ownerId)
              .tenantId(tenantId)
              .build();

      when(usersRepository.findByIdAndTenantId(ownerId, tenantId)).thenReturn(Optional.of(owner));
      when(usersRepository.countActiveOwnersByTenantId(tenantId)).thenReturn(2L);
      when(usersRepository.save(any(Users.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      // Act
      Users result = deactivateUserUseCase.deactivate(command);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getDeletedBy()).isEqualTo(ownerId);
      verify(usersRepository).save(any(Users.class));
    }
  }

  @Nested
  @DisplayName("Validation & Error Cases")
  class ErrorCases {

    @Test
    @DisplayName("Should throw LastOwnerCannotBeDeactivatedException when user is the last active Owner")
    void shouldThrowWhenDeactivatingLastOwner() {
      // Arrange
      UUID lastOwnerId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      TenantReference tenant =
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
              .deactivatedBy(UUID.randomUUID())
              .tenantId(tenantId)
              .build();

      when(usersRepository.findByIdAndTenantId(lastOwnerId, tenantId))
          .thenReturn(Optional.of(lastOwner));
      when(usersRepository.countActiveOwnersByTenantId(tenantId)).thenReturn(1L);

      // Act & Assert
      assertThatThrownBy(() -> deactivateUserUseCase.deactivate(command))
          .isInstanceOf(LastOwnerCannotBeDeactivatedException.class);

      verify(usersRepository, never()).save(any(Users.class));
    }

    @Test
    @DisplayName("Should throw UserAlreadyDeactivatedException when user is already deactivated")
    void shouldThrowWhenUserAlreadyDeactivated() {
      // Arrange
      UUID userId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      TenantReference tenant =
          TenantReference.builder().id(tenantId).companyName("Test Company").build();

      Users alreadyDeactivatedUser =
          Users.builder()
              .id(userId)
              .email("deactivated@example.com")
              .role(Roles.MANAGER)
              .tenant(tenant)
              .deletedAt(OffsetDateTime.now().minusDays(5))
              .build();

      DeactivateUserUseCase.DeactivateUserCommand command =
          DeactivateUserUseCase.DeactivateUserCommand.builder()
              .userIdToDeactivate(userId)
              .deactivatedBy(UUID.randomUUID())
              .tenantId(tenantId)
              .build();

      when(usersRepository.findByIdAndTenantId(userId, tenantId))
          .thenReturn(Optional.of(alreadyDeactivatedUser));

      // Act & Assert
      assertThatThrownBy(() -> deactivateUserUseCase.deactivate(command))
          .isInstanceOf(UserAlreadyDeactivatedException.class);

      verify(usersRepository, never()).save(any(Users.class));
    }

    @Test
    @DisplayName("Should throw UserNotExistsInTenantException when user is not found in tenant")
    void shouldThrowWhenUserNotFoundInTenant() {
      // Arrange
      UUID nonExistentUserId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();

      DeactivateUserUseCase.DeactivateUserCommand command =
          DeactivateUserUseCase.DeactivateUserCommand.builder()
              .userIdToDeactivate(nonExistentUserId)
              .deactivatedBy(UUID.randomUUID())
              .tenantId(tenantId)
              .build();

      when(usersRepository.findByIdAndTenantId(nonExistentUserId, tenantId))
          .thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> deactivateUserUseCase.deactivate(command))
          .isInstanceOf(UserNotExistsInTenantException.class);

      verify(usersRepository, never()).save(any(Users.class));
    }
  }
}
