package dev.angelcorzo.nivo.usecase.deactivateuser;

import dev.angelcorzo.nivo.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.exceptions.LastOwnerCannotBeDeactivatedException;
import dev.angelcorzo.nivo.model.users.exceptions.UserAlreadyDeactivatedException;
import dev.angelcorzo.nivo.model.users.exceptions.UserNotExistsInTenantException;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.RequiredArgsConstructor;

/**
 * Use case for deactivating a user within a specific tenant.
 *
 * <p>This class handles the business logic for marking a user as inactive, including validations to
 * prevent deactivating the last owner of a tenant.
 *
 * <p><strong>Layer:</strong> Application (Use Case)
 *
 * <p><strong>Responsibility:</strong> To manage the process of user deactivation.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see Users
 */
@RequiredArgsConstructor
public class DeactivateUserUseCase {
  private final UsersRepository usersRepository;
  private final TenantsRepository tenantsRepository;

  /**
   * Deactivates a user.
   *
   * @param command The command containing details for the deactivation.
   * @return The deactivated {@link Users} object.
   * @throws UserNotExistsInTenantException if the user does not exist within the specified tenant.
   * @throws UserAlreadyDeactivatedException if the user is already deactivated.
   * @throws LastOwnerCannotBeDeactivatedException if the user is the last owner of the tenant.
   */
  public Users deactivate(final DeactivateUserCommand command) {
    final Users user =
        this.usersRepository
            .findByIdAndTenantId(command.userIdToDeactivate(), command.tenantId())
            .orElseThrow(UserNotExistsInTenantException::new);

    this.validateDeactivation(user, command.tenantId());

    user.setDeletedAt(OffsetDateTime.now());
    user.setDeletedBy(command.deactivatedBy());

    return this.usersRepository.save(user);
  }

  /**
   * Validates the conditions for user deactivation.
   *
   * @param user The user to be deactivated.
   * @param tenantId The ID of the tenant.
   * @throws UserAlreadyDeactivatedException if the user is already deactivated.
   * @throws LastOwnerCannotBeDeactivatedException if the user is the last owner of the tenant.
   */
  private void validateDeactivation(final Users user, final UUID tenantId) {
    if (user.getDeletedAt() != null) {
      throw new UserAlreadyDeactivatedException(user.getId());
    }

    if (user.getRole() == Roles.OWNER) {
      final Long activeOwners = this.usersRepository.countActiveOwnersByTenantId(tenantId);
      if (activeOwners == 1) {
        throw new LastOwnerCannotBeDeactivatedException();
      }
    }
  }

  /**
   * Command object for the {@link DeactivateUserUseCase}.
   *
   * @param userIdToDeactivate The ID of the user to be deactivated.
   * @param deactivatedBy The ID of the user performing the deactivation.
   * @param tenantId The ID of the tenant where the user belongs.
   * @param reason An optional reason for the deactivation.
   */
  @Builder(toBuilder = true)
  public record DeactivateUserCommand(
      UUID userIdToDeactivate, UUID deactivatedBy, UUID tenantId, String reason) {}
}
