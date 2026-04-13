package dev.angelcorzo.nivo.model.parkinglots.gateways;

import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Defines the contract for persistence operations on ParkingLots entities.
 *
 * <p>This interface acts as a Port in the Domain layer, abstracting the data storage mechanism. The
 * implementation will be provided by an adapter in the Infrastructure layer.
 *
 * <p><strong>Layer:</strong> Domain (Gateway)
 *
 * <p><strong>Responsibility:</strong> To declare the necessary methods for managing the lifecycle
 * of {@link ParkingLots} aggregates.
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public interface ParkingLotsRepository {

  Optional<ParkingLots> findById(UUID id);

  /**
   * Finds all parking lots associated with a specific tenant.
   *
   * @param tenantId The unique identifier of the tenant.
   * @return A list of {@link ParkingLots} belonging to the tenant. Can be empty if none is found.
   */
  List<ParkingLots> findByTenantId(UUID tenantId);

  /**
   * Finds all parking lots owned by a specific user.
   *
   * @param ownerId The unique identifier of the owner user.
   * @return A list of {@link ParkingLots} owned by the user. Can be empty if none is found.
   */
  List<ParkingLots> findByOwnerId(UUID ownerId);

  ParkingLots getReferenceById(UUID id);

  Boolean existsById(UUID id);

  /**
   * Saves (creates or updates) a parking lot entity.
   *
   * @param parkingLots The {@link ParkingLots} entity to save.
   * @return {@link ParkingLots}
   */
  ParkingLots save(ParkingLots parkingLots);

  /**
   * Deletes a parking lot entity. This could be soft or hardly deleted depending on the
   * implementation.
   *
   * @param parkingLots The {@link ParkingLots} entity to delete.
   */
  void delete(ParkingLots parkingLots);
}
