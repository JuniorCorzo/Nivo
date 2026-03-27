package dev.angelcorzo.nivo.model.users;

import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Represents a User entity within the system.
 *
 * <p>This class is an aggregate root that holds all information related to a user, including their
 * personal data, credentials, role, and association with a Tenant.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * <p><strong>Responsibility:</strong> To manage the state and business rules of a user.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see Tenants
 * @see Roles
 */
@Getter
@Setter
@AllArgsConstructor
@Builder(toBuilder = true)
public class Users {
  /** The unique identifier for the User. */
  private UUID id;

  /** The user's full name. */
  private String fullName;

  /** The user's email address, used for login and communication. Must be unique within a Tenant. */
  private String email;

  /** The user's hashed password for authentication. */
  private String password;

  /** The role assigned to the user, which defines their permissions. */
  private Roles role;

  /** The Tenant to which the user belongs. */
  private TenantReference tenant;

  /** Additional contact information for the user, such as a phone number. */
  private String contactInfo;

  /** The ID of the user who performed a soft-delete on this user. Null if not deleted. */
  private UUID deletedBy;

  /** The timestamp when the user was created. */
  private OffsetDateTime createdAt;

  /** The timestamp of the last update to the user's information. */
  private OffsetDateTime updatedAt;

  /**
   * The timestamp when the user was soft-deleted. A non-null value indicates the user is inactive.
   */
  private OffsetDateTime deletedAt;
}
