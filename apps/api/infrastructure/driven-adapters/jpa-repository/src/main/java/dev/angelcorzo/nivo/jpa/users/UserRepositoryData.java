package dev.angelcorzo.nivo.jpa.users;

import dev.angelcorzo.nivo.model.users.enums.Roles;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * JPA Repository for {@link UsersData} entities.
 *
 * <p>This interface extends Spring Data JPA's {@link JpaRepository} to provide standard CRUD
 * operations and custom querying capabilities for User data.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA Repository)
 *
 * <p><strong>Responsibility:</strong> To interact with the database for User persistence.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see UsersData
 */
public interface UserRepositoryData extends JpaRepository<UsersData, UUID> {

  /**
   * Finds a user by their ID and eagerly fetches their associated tenant.
   *
   * @param id The unique identifier of the user.
   * @return An {@link Optional} containing the found {@link UsersData} entity with tenant, or empty
   *     if not found.
   */
  @EntityGraph(attributePaths = "tenant")
  @Query("SELECT u FROM UsersData u WHERE u.id = :id")
  Optional<UsersData> findByIdFetchTenant(@Param("id") UUID id);

  /**
   * Finds a user by their email address.
   *
   * @param email The email address of the user.
   * @return An {@link Optional} containing the found {@link UsersData} entity, or empty if not
   *     found.
   */
  Optional<UsersData> findByEmail(String email);

  /**
   * Finds a user by their ID and tenant ID, eagerly fetching the tenant.
   *
   * @param id The unique identifier of the user.
   * @param tenantId The unique identifier of the tenant.
   * @return An {@link Optional} containing the found {@link UsersData} entity with tenant, or empty
   *     if not found or not in the tenant.
   */
  @Query(
      "SELECT u FROM UsersData u LEFT JOIN FETCH u.tenant WHERE u.id = :id AND u.tenant.id = :tenantId")
  Optional<UsersData> findByIdAndTenant_Id(@Param("id") UUID id, @Param("tenantId") UUID tenantId);

  Boolean existsByIdAndTenantId(UUID id, UUID tenantId);

  /**
   * Checks if a user with the given email address exists within a specific tenant.
   *
   * @param email The email address to check.
   * @param tenantId The unique identifier of the tenant.
   * @return {@code true} if a user with the specified email exists in the tenant, {@code false}
   *     otherwise.
   */
  Boolean existsByEmailAndTenantId(String email, UUID tenantId);

  /**
   * Counts the number of users with a specific role within a given tenant.
   *
   * @param role The {@link Roles} to count.
   * @param tenantId The unique identifier of the tenant.
   * @return The count of users matching the criteria.
   */
  Long countByRoleAndTenantId(Roles role, UUID tenantId);

  /**
   * Assigns a user to a specific tenant.
   *
   * @param userId The unique identifier of the user to assign.
   * @param tenantId The unique identifier of the tenant to assign the user to.
   * @return The number of rows affected by the update.
   */
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(value = "UPDATE UsersData u SET u.tenant.id = :tenantId WHERE u.id = :userId")
  int assignTenant(@Param("userId") UUID userId, @Param("tenantId") UUID tenantId);
}
