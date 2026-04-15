package dev.angelcorzo.nivo.model.parkinglots;

import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.Users;
import java.time.OffsetDateTime;
import java.util.UUID;

import dev.angelcorzo.nivo.model.users.valueobject.UserReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a Parking Lot entity within the system.
 *
 * <p>This class is an aggregate root that contains all relevant information about a parking lot,
 * such as its identification, name, location, capacity, and operational settings.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * <p><strong>Responsibility:</strong> To hold the state and invariants of a parking lot.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see Address
 * @see OperatingHours
 */
@Getter
@Setter
@AllArgsConstructor
@Builder(toBuilder = true)
public class ParkingLots {
  /** The unique identifier for the parking lot. It is a UUID generated at the time of creation. */
  private UUID id;

  /** The commercial name of the parking lot. Example: "Central Parking". */
  private String name;

  /** A value object representing the physical address of the parking lot. */
  private Address address;

  /** A value object representing the geographic coordinates of the parking lot. */
  private Coordinates coordinates;

  /** The ID of the primary owner user of the parking lot. */
  private UserReference owner;

  /** The ID of the tenant to which this parking lot belongs. */
  private TenantReference tenant;

  /** The time zone in which the parking lot operates. Example: "America/Bogota". */
  private String timezone;

  /** The currency used for transactions in the parking lot. Example: "COP", "USD". */
  private String currency;

  /** A value object defining the operating hours of the parking lot. */
  private OperatingHours operatingHours;

  private OffsetDateTime createdAt;

  private OffsetDateTime updatedAt;

  private OffsetDateTime deletedAt;
}
