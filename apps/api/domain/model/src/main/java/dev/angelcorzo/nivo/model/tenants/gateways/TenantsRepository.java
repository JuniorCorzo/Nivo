package dev.angelcorzo.nivo.model.tenants.gateways;

import dev.angelcorzo.nivo.model.tenants.Tenants;
import java.util.Optional;
import java.util.UUID;

/**
 * Defines the contract for persistence operations on Tenants entities.
 *
 * <p>This interface acts as a Port in the Domain layer, abstracting the data storage mechanism. The
 * implementation will be provided by an adapter in the Infrastructure layer.
 *
 * <p><strong>Layer:</strong> Domain (Gateway)
 *
 * <p><strong>Responsibility:</strong> To declare the necessary methods for managing the lifecycle
 * of {@link Tenants} aggregates.
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public interface TenantsRepository {

  /**
   * Finds a tenant by its unique identifier.
   *
   * @param id The unique identifier of the tenant.
   * @return An {@link Optional} containing the found {@link Tenants} entity, or empty if not found.
   */
  Optional<Tenants> findById(UUID id);

  Tenants getReferenceById(UUID id);

  /**
   * Checks if a tenant with the given ID exists.
   *
   * @param id The unique identifier of the tenant to check.
   * @return {@code true} if a tenant with the specified ID exists, {@code false} otherwise.
   */
  Boolean existsById(UUID id);

  /**
   * Saves (creates or updates) a tenant entity.
   *
   * @param tenants The {@link Tenants} entity to save.
   * @return The saved entity.
   */
  Tenants save(Tenants tenants);

  /**
   * Deletes a tenant by its unique identifier.
   *
   * @param id The unique identifier of the tenant to delete.
   */
  void deleteById(UUID id);
}
