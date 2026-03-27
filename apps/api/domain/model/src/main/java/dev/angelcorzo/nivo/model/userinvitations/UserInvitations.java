package dev.angelcorzo.nivo.model.userinvitations;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Represents a user invitation to join a tenant.
 *
 * <p>This class holds all information related to an invitation, including who was invited,
 * to which tenant, with what role, and the status of the invitation.</p>
 *
 * <p><strong>Layer:</strong> Domain</p>
 * <p><strong>Responsibility:</strong> To manage the state and business rules of a user invitation.</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see Tenants
 * @see Users
 * @see Roles
 * @see UserInvitationStatus
 */
@Getter
@Setter
@AllArgsConstructor
@Builder(toBuilder = true)
public class UserInvitations {
    /**
     * The unique identifier for the invitation.
     */
    private UUID id;
    /**
     * The Tenant to which the user is being invited.
     */
    private Tenants tenant;
    /**
     * The email address of the person being invited.
     */
    private String invitedEmail;
    /**
     * The role that will be assigned to the user upon accepting the invitation.
     */
    private Roles role;
    /**
     * A unique, non-guessable token used to verify and accept the invitation.
     */
    private UUID token;
    /**
     * The current status of the invitation (e.g., PENDING, ACCEPTED, EXPIRED).
     */
    private UserInvitationStatus status;
    /**
     * The user who sent the invitation.
     */
    private UserReference invitedBy;
    /**
     * The timestamp when the invitation was created.
     */
    private OffsetDateTime createdAt;
    /**
     * The timestamp when the invitation was accepted. Null if not yet accepted.
     */
    private OffsetDateTime acceptedAt;
    /**
     * The timestamp when the invitation will expire and can no longer be accepted.
     */
    private OffsetDateTime expiredAt;
}
