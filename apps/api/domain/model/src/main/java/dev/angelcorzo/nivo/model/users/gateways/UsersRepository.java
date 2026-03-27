package dev.angelcorzo.nivo.model.users.gateways;

import dev.angelcorzo.nivo.model.users.Users;

import java.util.Optional;
import java.util.UUID;

/**
 * Defines the contract for persistence operations on User entities.
 *
 * <p>This interface acts as a Port in the Domain layer, abstracting the data storage
 * mechanism for user data. The implementation will be provided by an adapter
 * in the Infrastructure layer.</p>
 *
 * <p><strong>Layer:</strong> Domain (Gateway)</p>
 * <p><strong>Responsibility:</strong> To declare the necessary methods for managing
 * the lifecycle of {@link Users} aggregates.</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public interface UsersRepository {

    /**
     * Finds a user by their unique identifier.
     *
     * @param id The unique identifier of the user.
     * @return An {@link Optional} containing the found {@link Users} entity, or empty if not found.
     */
    Optional<Users> findById(UUID id);

    /**
     * Finds a user by their email address.
     *
     * @param email The email address of the user.
     * @return An {@link Optional} containing the found {@link Users} entity, or empty if not found.
     */
    Optional<Users> findByEmail(String email);

    /**
     * Finds a user by their ID, but only if they belong to the specified tenant.
     *
     * @param id The unique identifier of the user.
     * @param tenantId The unique identifier of the tenant.
     * @return An {@link Optional} containing the found {@link Users} entity, or empty if not found or not in the tenant.
     */
    Optional<Users> findByIdAndTenantId(UUID id, UUID tenantId);

    Users getReferenceById(UUID id);

    /**
     * Counts the number of active users with the 'OWNER' role within a specific tenant.
     *
     * @param tenantId The unique identifier of the tenant.
     * @return The total count of active owners.
     */
    Long countActiveOwnersByTenantId(UUID tenantId);

    /**
     * Checks if a user with the given ID exists.
     *
     * @param id The unique identifier of the user to check.
     * @return {@code true} if a user with the specified ID exists, {@code false} otherwise.
     */
    Boolean existsById(UUID id);

    Boolean existsByIdAndTenantId(UUID id, UUID tenantId);

    /**
     * Checks if a user with the given email address exists.
     *
     * @param email The email address to check.
     * @return {@code true} if a user with the specified email exists, {@code false} otherwise.
     */
    Boolean existsByEmail(String email);

    /**
     * Checks if a user with the given email address exists within a specific tenant.
     *
     * @param email The email address to check.
     * @param tenantId The unique identifier of the tenant.
     * @return {@code true} if a user with the specified email exists in the tenant, {@code false} otherwise.
     */
    Boolean existsByEmailAndTenantId(String email, UUID tenantId);

    /**
     * Saves (creates or updates) a user entity.
     *
     * @param users The {@link Users} entity to save.
     * @return The saved entity.
     */
    Users save(Users users);

    /**
     * Assigns a user to a tenant. This is typically used when an existing user is invited to a new tenant.
     *
     * @param userId The unique identifier of the user.
     * @param tenantId The unique identifier of the tenant to assign.
     * @return The number of rows affected.
     */
    int assignTenant(UUID userId, UUID tenantId);

    /**
     * Deletes a user by their unique identifier.
     *
     * @param id The unique identifier of the user to delete.
     */
    void deleteById(UUID id);
}
