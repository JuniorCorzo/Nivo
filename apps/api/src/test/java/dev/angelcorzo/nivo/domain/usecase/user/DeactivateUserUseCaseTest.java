package dev.angelcorzo.nivo.domain.usecase.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import dev.angelcorzo.nivo.domain.model.users.exceptions.LastOwnerCannotBeDeactivatedException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.SelfDeactivationNotAllowedException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.UserAlreadyDeactivatedException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.UserNotExistsInTenantException;
import dev.angelcorzo.nivo.domain.model.users.gateways.UsersRepository;
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
  @Mock private AuthenticationContextGateway authenticationContextGateway;

  @InjectMocks private DeactivateUserUseCase deactivateUserUseCase;

  @Nested
  @DisplayName("Happy Path")
  class HappyPath {

    @Test
    @DisplayName("Should deactivate non-Owner user successfully")
    void shouldDeactivateNonOwnerUserSuccessfully() {
      // Arrange
      UUID userToDeactivateId = UUID.randomUUID();
      UUID actorId = UUID.randomUUID();
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
              .deactivatedBy(UUID.randomUUID()) // forged / client-supplied
              .tenantId(tenantId)
              .reason("Contract ended")
              .build();

      when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
      when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
      when(usersRepository.findByIdAndTenantId(userToDeactivateId, tenantId))
          .thenReturn(Optional.of(userToDeactivate));
      when(usersRepository.save(any(Users.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      // Act
      Users result = deactivateUserUseCase.deactivate(command);

      // Assert
      assertThat(result).isNotNull();
      assertThat(result.getId()).isEqualTo(userToDeactivateId);
      assertThat(result.getDeletedBy()).isEqualTo(actorId);
      assertThat(result.getDeletedAt()).isNotNull();

      ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
      verify(usersRepository).save(userCaptor.capture());
      assertThat(userCaptor.getValue().getDeletedBy()).isEqualTo(actorId);
    }

    @Test
    @DisplayName("Should deactivate Owner when multiple Owners exist in tenant")
    void shouldDeactivateOwnerWhenMultipleOwnersExist() {
      // Arrange
      UUID ownerToDeactivateId = UUID.randomUUID();
      UUID actorId = UUID.randomUUID();
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
              .deactivatedBy(UUID.randomUUID())
              .tenantId(tenantId)
              .build();

      when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
      when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
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
      assertThat(result.getDeletedBy()).isEqualTo(actorId);
      verify(usersRepository).countActiveOwnersByTenantId(tenantId);
      verify(usersRepository).save(any(Users.class));
    }
  }

  @Nested
  @DisplayName("Validation & Error Cases")
  class ErrorCases {

    @Test
    @DisplayName("Should throw SelfDeactivationNotAllowedException when user attempts self-deactivation")
    void shouldThrowWhenAttemptingSelfDeactivation() {
      // Arrange
      UUID actorId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();

      DeactivateUserUseCase.DeactivateUserCommand command =
          DeactivateUserUseCase.DeactivateUserCommand.builder()
              .userIdToDeactivate(actorId)
              .deactivatedBy(actorId)
              .tenantId(tenantId)
              .build();

      when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
      when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);

      // Act & Assert
      assertThatThrownBy(() -> deactivateUserUseCase.deactivate(command))
          .isInstanceOf(SelfDeactivationNotAllowedException.class);

      verify(usersRepository, never()).findByIdAndTenantId(any(), any());
      verify(usersRepository, never()).save(any(Users.class));
    }

    @Test
    @DisplayName("Should throw LastOwnerCannotBeDeactivatedException when user is the last active Owner")
    void shouldThrowWhenDeactivatingLastOwner() {
      // Arrange
      UUID lastOwnerId = UUID.randomUUID();
      UUID actorId = UUID.randomUUID();
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
              .deactivatedBy(actorId)
              .tenantId(tenantId)
              .build();

      when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
      when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
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
      UUID actorId = UUID.randomUUID();
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
              .deactivatedBy(actorId)
              .tenantId(tenantId)
              .build();

      when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
      when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
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
      UUID actorId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();

      DeactivateUserUseCase.DeactivateUserCommand command =
          DeactivateUserUseCase.DeactivateUserCommand.builder()
              .userIdToDeactivate(nonExistentUserId)
              .deactivatedBy(actorId)
              .tenantId(tenantId)
              .build();

      when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
      when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
      when(usersRepository.findByIdAndTenantId(nonExistentUserId, tenantId))
          .thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> deactivateUserUseCase.deactivate(command))
          .isInstanceOf(UserNotExistsInTenantException.class);

      verify(usersRepository, never()).save(any(Users.class));
    }

    @Test
    @DisplayName("Should use tenantId and actorId from AuthenticationContextGateway, ignoring command values")
    void shouldResolveTenantAndActorFromGatewayIgnoringCommand() {
      // Arrange
      UUID targetUserId = UUID.randomUUID();
      UUID contextActorId = UUID.randomUUID();
      UUID forgedActorId = UUID.randomUUID();
      UUID contextTenantId = UUID.randomUUID();
      UUID forgedTenantId = UUID.randomUUID();

      TenantReference tenant =
          TenantReference.builder().id(contextTenantId).companyName("Test Company").build();

      Users targetUser =
          Users.builder()
              .id(targetUserId)
              .email("operator@example.com")
              .role(Roles.OPERATOR)
              .tenant(tenant)
              .build();

      DeactivateUserUseCase.DeactivateUserCommand command =
          DeactivateUserUseCase.DeactivateUserCommand.builder()
              .userIdToDeactivate(targetUserId)
              .deactivatedBy(forgedActorId)
              .tenantId(forgedTenantId)
              .build();

      when(authenticationContextGateway.getCurrentTenantId()).thenReturn(contextTenantId);
      when(authenticationContextGateway.getCurrentUserId()).thenReturn(contextActorId);
      when(usersRepository.findByIdAndTenantId(targetUserId, contextTenantId))
          .thenReturn(Optional.of(targetUser));
      when(usersRepository.save(any(Users.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      // Act
      Users result = deactivateUserUseCase.deactivate(command);

      // Assert
      assertThat(result.getDeletedBy()).isEqualTo(contextActorId);
      verify(usersRepository).findByIdAndTenantId(targetUserId, contextTenantId);
      verify(usersRepository, never()).findByIdAndTenantId(targetUserId, forgedTenantId);
    }
  }
}
