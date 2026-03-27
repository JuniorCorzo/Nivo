package dev.angelcorzo.nivo.model.users.enums;

/**
 * Defines the roles a user can have within a tenant.
 *
 * <p>Each role grants a different set of permissions and capabilities within the system.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * <p><strong>Responsibility:</strong> To provide a type-safe representation of user roles.
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public enum Roles {
  /**
   * The highest-level administrative role. Has full control over the entire system, including all
   * tenants and their resources.
   */
  SUPERADMIN,
  /**
   * The highest-level role within a specific tenant. Has full control over the tenant and its
   * resources. Can manage users, parking lots, and billing within their tenant.
   */
  OWNER,
  /**
   * Manages the day-to-day operations of one or more parking lots. Can view reports and manage
   * staff (Operators).
   */
  MANAGER,
  /**
   * A staff member who operates the parking lot entry and exit points. Can register vehicle entries
   * and exits.
   */
  OPERATOR,
  /**
   * A standard user (customer) who uses the parking service. Can view their parking history and
   * manage their vehicles.
   */
  DRIVER,
  /** A read-only role for auditing purposes. Can view all data but cannot make any changes. */
  AUDITOR
}
