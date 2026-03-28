package dev.angelcorzo.nivo.usecase.modifyuserrole;

import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.exceptions.UserNotExistsInTenantException;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.usecase.acceptinvitation.exceptions.InvalidRoleException;
import dev.angelcorzo.nivo.usecase.notifications.UserNotifier;
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

  /**
   * Modifies the role of a user.
   *
   * @param modifyUserRole The command containing the user ID, new role, and tenant ID.
   * @return The updated {@link Users} object.
   * @throws UserNotExistsInTenantException if the user does not exist within the specified tenant.
   * @throws InvalidRoleException if the new role is not permitted (e.g., OWNER, SUPERADMIN).
   */
  public Users modifyRole(final ModifyUserRole modifyUserRole) {
    Users user =
        this.usersRepository
            .findByIdAndTenantId(modifyUserRole.userId(), modifyUserRole.tenantId())
            .orElseThrow(UserNotExistsInTenantException::new);

    this.validateRolePermitted(modifyUserRole.newRole());
    user.setRole(modifyUserRole.newRole());

    user = this.usersRepository.save(user);
    this.userNotifier.notifyUserRoleAssigned(user);
    return user;
  }

  /**
   * Validates if the new role is permitted for assignment. Certain roles (like OWNER, SUPERADMIN)
   * might not be assignable through this operation.
   *
   * @param role The role to validate.
   * @throws InvalidRoleException if the role is not permitted.
   */
  private void validateRolePermitted(Roles role) {
    Set<Roles> rolesNotPermitted = Set.of(Roles.OWNER, Roles.SUPERADMIN);
    if (rolesNotPermitted.contains(role)) {
      throw new InvalidRoleException(role);
    }
  }

  /**
   * Command object for the {@link ModifyUserRoleUseCase}.
   *
   * @param userId The ID of the user whose role is to be modified.
   * @param newRole The new role to assign to the user.
   * @param tenantId The ID of the tenant where the user belongs.
   */
  @Builder(toBuilder = true)
  public record ModifyUserRole(UUID userId, Roles newRole, UUID tenantId) {}
}
