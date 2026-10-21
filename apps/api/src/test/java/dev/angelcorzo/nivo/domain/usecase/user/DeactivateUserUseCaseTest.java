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

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private AuthenticationContextGateway authenticationContextGateway;

    @InjectMocks
    private DeactivateUserUseCase deactivateUserUseCase;

    @Nested
    @DisplayName("Happy Path")
    class HappyPath {

        @Test
        @DisplayName("Should deactivate non-Owner user successfully")
        void shouldDeactivateNonOwnerUserSuccessfully() {
            // Arrange
            final UUID userToDeactivateId = UUID.randomUUID();
            final UUID actorId = UUID.randomUUID();
            final UUID tenantId = UUID.randomUUID();

            final TenantReference tenant = TenantReference.builder().id(tenantId).companyName("Test Company").build();

            final Users userToDeactivate = Users.builder().id(userToDeactivateId).email("operator@example.com")
                .fullName("Operator User").role(Roles.OPERATOR).tenant(tenant)
                .createdAt(OffsetDateTime.now().minusDays(10)).deletedAt(null).build();

            final DeactivateUserUseCase.DeactivateUserCommand command = DeactivateUserUseCase.DeactivateUserCommand
                .builder().userIdToDeactivate(userToDeactivateId).reason("Contract ended").build();

            when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
            when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
            when(usersRepository.findByIdAndTenantId(userToDeactivateId, tenantId))
                .thenReturn(Optional.of(userToDeactivate));
            when(usersRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            final Users result = deactivateUserUseCase.deactivate(command);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(userToDeactivateId);
            assertThat(result.getDeletedBy()).isEqualTo(actorId);
            assertThat(result.getDeletedAt()).isNotNull();

            final ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
            verify(usersRepository).save(userCaptor.capture());
            assertThat(userCaptor.getValue().getDeletedBy()).isEqualTo(actorId);
        }

        @Test
        @DisplayName("Should deactivate Owner when multiple Owners exist in tenant")
        void shouldDeactivateOwnerWhenMultipleOwnersExist() {
            // Arrange
            final UUID ownerToDeactivateId = UUID.randomUUID();
            final UUID actorId = UUID.randomUUID();
            final UUID tenantId = UUID.randomUUID();

            final TenantReference tenant = TenantReference.builder().id(tenantId).companyName("Test Company").build();

            final Users ownerToDeactivate = Users.builder().id(ownerToDeactivateId).email("owner1@example.com")
                .role(Roles.OWNER).tenant(tenant).deletedAt(null).build();

            final DeactivateUserUseCase.DeactivateUserCommand command = DeactivateUserUseCase.DeactivateUserCommand
                .builder().userIdToDeactivate(ownerToDeactivateId).build();

            when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
            when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
            when(usersRepository.findByIdAndTenantId(ownerToDeactivateId, tenantId))
                .thenReturn(Optional.of(ownerToDeactivate));
            when(usersRepository.countActiveOwnersByTenantId(tenantId)).thenReturn(2L);
            when(usersRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            final Users result = deactivateUserUseCase.deactivate(command);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getDeletedAt()).isNotNull();
            assertThat(result.getDeletedBy()).isEqualTo(actorId);
            verify(usersRepository).countActiveOwnersByTenantId(tenantId);
            verify(usersRepository).save(any(Users.class));
        }

        @Test
        @DisplayName("Should deactivate Operator in tenant with only one active owner without throwing LastOwnerCannotBeDeactivatedException")
        void shouldDeactivateOperatorWhenTenantHasOnlyOneActiveOwner() {
            // Arrange
            final UUID operatorId = UUID.randomUUID();
            final UUID actorId = UUID.randomUUID();
            final UUID tenantId = UUID.randomUUID();

            final TenantReference tenant = TenantReference.builder().id(tenantId).companyName("Test Company").build();

            final Users operatorUser = Users.builder().id(operatorId).email("operator@example.com")
                .fullName("Operator User").role(Roles.OPERATOR).tenant(tenant).deletedAt(null).build();

            final DeactivateUserUseCase.DeactivateUserCommand command = DeactivateUserUseCase.DeactivateUserCommand
                .builder().userIdToDeactivate(operatorId).reason("Deactivating operator").build();

            when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
            when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
            when(usersRepository.findByIdAndTenantId(operatorId, tenantId)).thenReturn(Optional.of(operatorUser));
            when(usersRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            final Users result = deactivateUserUseCase.deactivate(command);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(operatorId);
            assertThat(result.getDeletedBy()).isEqualTo(actorId);
            assertThat(result.getDeletedAt()).isNotNull();

            verify(usersRepository, never()).countActiveOwnersByTenantId(any());
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
            final UUID actorId = UUID.randomUUID();
            final UUID tenantId = UUID.randomUUID();

            final DeactivateUserUseCase.DeactivateUserCommand command = DeactivateUserUseCase.DeactivateUserCommand
                .builder().userIdToDeactivate(actorId).build();

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
            final UUID lastOwnerId = UUID.randomUUID();
            final UUID actorId = UUID.randomUUID();
            final UUID tenantId = UUID.randomUUID();
            final TenantReference tenant = TenantReference.builder().id(tenantId).companyName("Test Company").build();

            final Users lastOwner = Users.builder().id(lastOwnerId).email("lastowner@example.com").role(Roles.OWNER)
                .tenant(tenant).deletedAt(null).build();

            final DeactivateUserUseCase.DeactivateUserCommand command = DeactivateUserUseCase.DeactivateUserCommand
                .builder().userIdToDeactivate(lastOwnerId).build();

            when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
            when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
            when(usersRepository.findByIdAndTenantId(lastOwnerId, tenantId)).thenReturn(Optional.of(lastOwner));
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
            final UUID userId = UUID.randomUUID();
            final UUID actorId = UUID.randomUUID();
            final UUID tenantId = UUID.randomUUID();
            final TenantReference tenant = TenantReference.builder().id(tenantId).companyName("Test Company").build();

            final Users alreadyDeactivatedUser = Users.builder().id(userId).email("deactivated@example.com")
                .role(Roles.MANAGER).tenant(tenant).deletedAt(OffsetDateTime.now().minusDays(5)).build();

            final DeactivateUserUseCase.DeactivateUserCommand command = DeactivateUserUseCase.DeactivateUserCommand
                .builder().userIdToDeactivate(userId).build();

            when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
            when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
            when(usersRepository.findByIdAndTenantId(userId, tenantId)).thenReturn(Optional.of(alreadyDeactivatedUser));

            // Act & Assert
            assertThatThrownBy(() -> deactivateUserUseCase.deactivate(command))
                .isInstanceOf(UserAlreadyDeactivatedException.class);

            verify(usersRepository, never()).save(any(Users.class));
        }

        @Test
        @DisplayName("Should throw UserNotExistsInTenantException when user is not found in tenant")
        void shouldThrowWhenUserNotFoundInTenant() {
            // Arrange
            final UUID nonExistentUserId = UUID.randomUUID();
            final UUID actorId = UUID.randomUUID();
            final UUID tenantId = UUID.randomUUID();

            final DeactivateUserUseCase.DeactivateUserCommand command = DeactivateUserUseCase.DeactivateUserCommand
                .builder().userIdToDeactivate(nonExistentUserId).build();

            when(authenticationContextGateway.getCurrentTenantId()).thenReturn(tenantId);
            when(authenticationContextGateway.getCurrentUserId()).thenReturn(actorId);
            when(usersRepository.findByIdAndTenantId(nonExistentUserId, tenantId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> deactivateUserUseCase.deactivate(command))
                .isInstanceOf(UserNotExistsInTenantException.class);

            verify(usersRepository, never()).save(any(Users.class));
        }

        @Test
        @DisplayName("Should use tenantId and actorId from AuthenticationContextGateway")
        void shouldResolveTenantAndActorFromGateway() {
            // Arrange
            final UUID targetUserId = UUID.randomUUID();
            final UUID contextActorId = UUID.randomUUID();
            final UUID contextTenantId = UUID.randomUUID();

            final TenantReference tenant = TenantReference.builder().id(contextTenantId).companyName("Test Company")
                .build();

            final Users targetUser = Users.builder().id(targetUserId).email("operator@example.com").role(Roles.OPERATOR)
                .tenant(tenant).build();

            final DeactivateUserUseCase.DeactivateUserCommand command = DeactivateUserUseCase.DeactivateUserCommand
                .builder().userIdToDeactivate(targetUserId).build();

            when(authenticationContextGateway.getCurrentTenantId()).thenReturn(contextTenantId);
            when(authenticationContextGateway.getCurrentUserId()).thenReturn(contextActorId);
            when(usersRepository.findByIdAndTenantId(targetUserId, contextTenantId))
                .thenReturn(Optional.of(targetUser));
            when(usersRepository.save(any(Users.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // Act
            final Users result = deactivateUserUseCase.deactivate(command);

            // Assert
            assertThat(result.getDeletedBy()).isEqualTo(contextActorId);
            verify(authenticationContextGateway, times(1)).getCurrentTenantId();
            verify(authenticationContextGateway, times(1)).getCurrentUserId();
            verify(usersRepository).findByIdAndTenantId(targetUserId, contextTenantId);
        }
    }
}
