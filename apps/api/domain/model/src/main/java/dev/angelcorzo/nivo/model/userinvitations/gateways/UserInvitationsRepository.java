package dev.angelcorzo.nivo.model.userinvitations.gateways;

import dev.angelcorzo.nivo.model.userinvitations.UserInvitations;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Defines the contract for persistence operations on UserInvitation entities.
 *
 * <p>This interface acts as a Port in the Domain layer, abstracting the data storage
 * mechanism for user invitation data.</p>
 *
 * <p><strong>Layer:</strong> Domain (Gateway)</p>
 * <p><strong>Responsibility:</strong> To declare the necessary methods for managing
 * the lifecycle of {@link UserInvitations} aggregates.</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public interface UserInvitationsRepository {

    /**
     * Finds all invitations associated with a specific tenant.
     *
     * @param tenantId The unique identifier of the tenant.
     * @return A list of {@link UserInvitations}. Can be empty if none are found.
     */
    List<UserInvitations> findAllInvitationsByTenantId(UUID tenantId);

    /**
     * Finds an invitation by its unique token.
     *
     * @param token The unique token of the invitation.
     * @return An {@link Optional} containing the found {@link UserInvitations} entity, or empty if not found.
     */
    Optional<UserInvitations> findByToken(UUID token);

    /**
     * Saves (creates or updates) a user invitation entity.
     *
     * @param userInvitations The {@link UserInvitations} entity to save.
     * @return The saved entity.
     */
    UserInvitations save(UserInvitations userInvitations);

    /**
     * Marks an invitation as accepted.
     *
     * @param id The unique identifier of the invitation to accept.
     * @return The updated entity, typically with the status changed to ACCEPTED.
     */
    UserInvitations acceptedInvitation(UUID id);

    /**
     * Marks an invitation as revoked.
     *
     * @param id The unique identifier of the invitation to revoke.
     * @return {@code true} if the invitation was successfully revoked, {@code false} otherwise.
     */
    Boolean revokeInvitation(UUID id);
}
