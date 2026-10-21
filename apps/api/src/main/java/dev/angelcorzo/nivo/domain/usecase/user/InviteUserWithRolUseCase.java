package dev.angelcorzo.nivo.domain.usecase.user;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.tenants.Tenants;
import dev.angelcorzo.nivo.domain.model.tenants.exceptions.TenantNotExistsException;
import dev.angelcorzo.nivo.domain.model.tenants.gateways.TenantsRepository;
import dev.angelcorzo.nivo.domain.model.userinvitations.UserInvitationStatus;
import dev.angelcorzo.nivo.domain.model.userinvitations.UserInvitations;
import dev.angelcorzo.nivo.domain.model.userinvitations.gateways.UserInvitationsRepository;
import dev.angelcorzo.nivo.domain.model.users.Users;
import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import dev.angelcorzo.nivo.domain.model.users.exceptions.UserAlreadyExistsInTenantException;
import dev.angelcorzo.nivo.domain.model.users.exceptions.UserNotExistsException;
import dev.angelcorzo.nivo.domain.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.domain.model.users.valueobject.UserReference;
import dev.angelcorzo.nivo.domain.usecase.notification.notifier.UserNotifier;
import dev.angelcorzo.nivo.domain.usecase.user.exceptions.InvalidRoleException;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;
import lombok.Builder;
import lombok.RequiredArgsConstructor;

/**
 * Use case for inviting a new user to a tenant with a specific role.
 *
 * <p>This class handles the business logic for creating and registering a user invitation,
 * including validation of the tenant, inviter, and the role being assigned.
 *
 * <p><strong>Layer:</strong> Application (Use Case)
 *
 * <p><strong>Responsibility:</strong> To manage the process of inviting users to a tenant.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see UserInvitations
 * @see Users
 * @see Tenants
 * @see Roles
 */
@RequiredArgsConstructor
public class InviteUserWithRolUseCase {
  private static final int EXPIRATION_DAYS = 3;
  private final UsersRepository usersRepository;
  private final UserInvitationsRepository userInvitationsRepository;
  private final TenantsRepository tenantsRepository;
  private final UserNotifier userNotifier;
  private final AuthenticationContextGateway authenticationContextGateway;

  /**
   * Registers a new user invitation.
   *
   * @param inviteUserWithRole The command containing details for the invitation (email, role,
   *     tenant ID, inviter ID).
   * @return The created {@link UserInvitations} object.
   * @throws UserAlreadyExistsInTenantException if the invited email already exists within the
   *     tenant.
   * @throws InvalidRoleException if the specified role is not permitted for invitations (e.g.,
   *     OWNER, SUPERADMIN).
   * @throws UserNotExistsException if the inviter user does not exist.
   * @throws TenantNotExistsException if the specified tenant does not exist.
   */
  public UserInvitations registerInvitation(final InviteUserWithRole inviteUserWithRole) {
    final UUID tenantId = this.authenticationContextGateway.getCurrentTenantId();
    final UUID inviteBy = this.authenticationContextGateway.getCurrentUserId();

    this.validateInvitation(inviteUserWithRole, tenantId);
    final Tenants tenant =
        this.tenantsRepository
            .findById(tenantId)
            .orElseThrow(() -> new TenantNotExistsException(tenantId));

    final Users invitedBy =
        this.usersRepository
            .findById(inviteBy)
            .orElseThrow(() -> new UserNotExistsException(inviteBy));

    final UserInvitations userInvitations =
        UserInvitations.builder()
            .tenant(tenant)
            .invitedEmail(inviteUserWithRole.email())
            .role(inviteUserWithRole.role())
            .token(UUID.randomUUID())
            .status(UserInvitationStatus.PENDING)
            .invitedBy(UserReference.of(invitedBy))
            .createdAt(OffsetDateTime.now())
            .expiredAt(OffsetDateTime.now().plusDays(EXPIRATION_DAYS))
            .build();

    UserInvitations userInvitation = this.userInvitationsRepository.save(userInvitations);
    this.sendNotification(userInvitation);
    return userInvitation;
  }

  /**
   * Validates the invitation details against business rules before registration.
   *
   * @param invitation The invitation command to validate.
   * @param tenantId The validated tenant ID.
   * @throws UserAlreadyExistsInTenantException if the invited email already exists within the
   *     tenant.
   * @throws InvalidRoleException if the specified role is not permitted.
   */
  private void validateInvitation(final InviteUserWithRole invitation, final UUID tenantId) {
    final String email = invitation.email();
    final Roles rol = invitation.role();

    if (this.usersRepository.existsByEmailAndTenantId(email, tenantId)) {
      throw new UserAlreadyExistsInTenantException(email);
    }

    this.validateRolePermitted(rol);
  }

  /**
   * Validates if the role specified in the invitation is permitted. Certain roles (like OWNER,
   * SUPERADMIN) might not be assignable via invitation.
   *
   * @param rol The role to validate.
   * @throws InvalidRoleException if the role is not permitted.
   */
  private void validateRolePermitted(Roles rol) {
    final Set<Roles> rolesNotPermitted = Set.of(Roles.OWNER, Roles.SUPERADMIN);
    if (rolesNotPermitted.contains(rol)) throw new InvalidRoleException(rol);
  }

  private void sendNotification(UserInvitations userInvitations) {
    this.userNotifier.notifyUserInvited(userInvitations);
  }

  /**
   * Command object for the {@link InviteUserWithRolUseCase}.
   *
   * @param email The email address of the user to invite.
   * @param role The role to assign to the invited user.
   * @param tenantId The ID of the tenant to which the user is invited.
   * @param inviteBy The ID of the user who is sending the invitation.
   */
  @Builder(toBuilder = true)
  public record InviteUserWithRole(String email, Roles role, UUID tenantId, UUID inviteBy) {}
}
