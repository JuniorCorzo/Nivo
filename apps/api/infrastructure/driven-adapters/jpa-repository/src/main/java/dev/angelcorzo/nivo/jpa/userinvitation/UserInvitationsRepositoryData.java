package dev.angelcorzo.nivo.jpa.userinvitation;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * JPA Repository for {@link UserInvitationsData} entities.
 *
 * <p>This interface extends Spring Data JPA's {@link JpaRepository} to provide
 * standard CRUD operations and custom querying capabilities for User Invitation data.</p>
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA Repository)</p>
 * <p><strong>Responsibility:</strong> To interact with the database for User Invitation persistence.</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see UserInvitationsData
 */
public interface UserInvitationsRepositoryData extends JpaRepository<UserInvitationsData, UUID> {
  /**
   * Finds all user invitations associated with a specific tenant.
   *
   * @param tenantId The unique identifier of the tenant.
   * @return A list of {@link UserInvitationsData} for the given tenant.
   */
  List<UserInvitationsData> findAllByTenantId(UUID tenantId);

  /**
   * Finds a user invitation by its unique token.
   *
   * @param token The unique token of the invitation.
   * @return An {@link Optional} containing the found {@link UserInvitationsData} entity, or empty if not found.
   */
  Optional<UserInvitationsData> findByToken(UUID token);

  /**
   * Marks a user invitation as 'ACCEPTED' and sets the 'accepted_at' timestamp.
   *
   * @param id The unique identifier of the invitation to accept.
   */
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(value = "UPDATE user_invitations SET status = 'ACCEPTED', accepted_at = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' WHERE id = :id", nativeQuery = true)
  void acceptedInvitation(@Param("id") UUID id);

  /**
   * Marks a user invitation as 'REVOKED'.
   *
   * @param id The unique identifier of the invitation to revoke.
   * @return The number of entities updated.
   */
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(value = "UPDATE UserInvitationsData u SET u.status = 'REVOKED' WHERE u.id = :id")
  int revokeInvitation(@Param("id") UUID id);
}
