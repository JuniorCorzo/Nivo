package dev.angelcorzo.nivo.model.userinvitations;

/**
 * Represents the status of a user invitation.
 *
 * <p>This enum tracks the lifecycle of an invitation from its creation until it is
 * resolved (accepted, expired, or revoked).</p>
 *
 * <p><strong>Layer:</strong> Domain</p>
 * <p><strong>Responsibility:</strong> To provide a type-safe representation of invitation states.</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public enum UserInvitationStatus {
    /**
     * The invitation has been sent and is awaiting a response.
     */
    PENDING,
    /**
     * The invitation has been successfully accepted by the user.
     */
    ACCEPTED,
    /**
     * The invitation was not accepted within the allowed time frame and is no longer valid.
     */
    EXPIRED,
    /**
     * The invitation was manually revoked by an administrator or manager before it could be accepted.
     */
    REVOKED
}
