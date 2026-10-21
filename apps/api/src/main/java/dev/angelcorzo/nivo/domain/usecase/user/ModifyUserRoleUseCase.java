package dev.angelcorzo.nivo.domain.usecase.user;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import dev.angelcorzo.nivo.domain.model.users.exceptions.CannotModifyOwnerRoleException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.SelfRoleModificationNotAllowedException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.UserNotExistsInTenantException;
import dev.angelcorzo.nivo.domain.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.domain.usecase.notification.notifier.UserNotifier;
import dev.angelcorzo.nivo.domain.usecase.user.exceptions.InvalidRoleException;
import java.util.Set;
import java.util.UUID;
import lombok.Builder;
import lombok.RequiredArgsConstructor;

/**
 * Use case for modifying the role of an existing user within a specific tenant.
 *
 * <p>This class handles the business logic for updating a user's role, including validation to
 * ensure the user exists within the tenant and the new role is permitted.
 *
 * <p><strong>Layer:</strong> Application (Use Case)
 *
 * <p><strong>Responsibility:</strong> To manage the process of changing a user's role.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see Users
 * @see Roles
 * @see Tenants
 */
@RequiredArgsConstructor
public class ModifyUserRoleUseCase {
    private final UsersRepository usersRepository;
    private final UserNotifier userNotifier;
    private final AuthenticationContextGateway authenticationContextGateway;

    /**
     * Modifies the role of a user.
     *
     * @param modifyUserRole The command containing the user ID, new role, and tenant ID.
     * @return The updated {@link Users} object.
     * @throws SelfRoleModificationNotAllowedException if the target user is the authenticated user.
     * @throws UserNotExistsInTenantException if the user does not exist within the specified tenant.
     * @throws CannotModifyOwnerRoleException if attempting to change an OWNER or SUPERADMIN user's role.
     * @throws InvalidRoleException if the new role is not permitted (e.g., OWNER, SUPERADMIN).
     */
    public Users modifyRole(final ModifyUserRole modifyUserRole) {
        final UUID tenantId = this.authenticationContextGateway.getCurrentTenantId();
        final UUID currentUserId = this.authenticationContextGateway.getCurrentUserId();

        if (modifyUserRole.userId().equals(currentUserId)) {
            throw new SelfRoleModificationNotAllowedException();
        }

        final Users user = this.usersRepository
                .findByIdAndTenantId(modifyUserRole.userId(), tenantId)
                .orElseThrow(UserNotExistsInTenantException::new);

        if (user.getRole() == Roles.OWNER || user.getRole() == Roles.SUPERADMIN) {
            throw new CannotModifyOwnerRoleException();
        }

        this.validateRolePermitted(modifyUserRole.newRole());
        user.setRole(modifyUserRole.newRole());

        final Users savedUser = this.usersRepository.save(user);
        this.userNotifier.notifyUserRoleAssigned(savedUser);
        return savedUser;
    }

    /**
     * Validates if the new role is permitted for assignment. Certain roles (like OWNER, SUPERADMIN)
     * might not be assignable through this operation.
     *
     * @param role The role to validate.
     * @throws InvalidRoleException if the role is not permitted.
     */
    private void validateRolePermitted(final Roles role) {
        final Set<Roles> rolesNotPermitted = Set.of(Roles.OWNER, Roles.SUPERADMIN);
        if (rolesNotPermitted.contains(role)) {
            throw new InvalidRoleException(role);
        }
    }

    /**
     * Command object for the {@link ModifyUserRoleUseCase}.
     *
     * @param userId The ID of the user whose role is to be modified.
     * @param newRole The new role to assign to the user.
     */
    @Builder(toBuilder = true)
    public record ModifyUserRole(UUID userId, Roles newRole) {}
}
