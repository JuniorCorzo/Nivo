package dev.angelcorzo.nivo.model.commons.exceptions;

/**
 * Enum to standardize error message templates across the domain layer.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * <p><strong>Responsibility:</strong> To provide a single source of truth for error message
 * formats.
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public enum ErrorMessagesModel {
  INVITATION_NOT_FOUND("Invitación no encontrada"),
  INVITATION_EXPIRED("La invitación expiró"),
  INVITATION_ALREADY_ACCEPTED("La invitación fue aceptada el %s"),
  USER_NOT_EXIST_EMAIL("El usuario con email %s no existe"),
  USER_NOT_EXIST_ID("El usuario con ID %s no existe"),
  USER_NOT_EXIST_IN_TENANT("El usuario no está asociado al tenant"),
  USER_AUTHENTICATION_INVALID("Error en la autentificación del usuario."),
  USER_ALREADY_DEACTIVATED("El usuario %s ya fue desactivado"),
  USER_BAD_CREDENTIALS("Credenciales incorrectas"),
  LAST_OWNER_CANNOT_BE_DEACTIVATED("El último dueño no puede ser desactivado"),
  TENANT_NOT_EXISTS("El inquilino con ID %s no está registrado"),
  PARKING_NOT_EXISTS("El parking con ID %s no está registrado"),
  SLOT_NOT_EXISTS("El slot con ID %s no está registrado"),
  SPECIAL_POLICY_NOT_FOUNT("La política especial con ID %s no está registrada"),
  PARKING_TICKET_NOT_FOUND("La reserva con ID %s no está registrada"),
  RATE_NOT_FOUND("La tarifa con ID %s no está registrada"),
  PAYMENT_NOT_FOUND_BY_TRANSACTION_ID("El pago con ID de transacción %s no está registrado");

  private final String template;

  ErrorMessagesModel(String template) {
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
