package dev.angelcorzo.nivo.domain.model.tenants.exceptions;

/**
 * Standardized error message templates for Tenant domain operations.
 *
 * <p>
 * <strong>Layer:</strong> Domain (Tenants)
 */
public enum TenantErrorMessages {
  TENANT_NOT_EXISTS("El inquilino con ID %s no está registrado"),
  NO_OWNER_IN_TENANT("No se encontró un usuario con rol OWNER en el tenant %s"),
  ACCOUNT_CREATION_DISABLED("La creación de cuentas no está habilitada temporalmente");

  private final String template;

  TenantErrorMessages(String template) {
    this.template = template;
  }

  public String format(Object... values) {
    return String.format(template, values);
  }

  @Override
  public String toString() {
    return template;
  }
}
