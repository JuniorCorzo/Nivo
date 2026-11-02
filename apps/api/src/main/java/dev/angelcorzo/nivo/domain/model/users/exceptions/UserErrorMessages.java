package dev.angelcorzo.nivo.domain.model.users.exceptions;

/**
 * Standardized error message templates for User domain operations.
 *
 * <p>
 * <strong>Layer:</strong> Domain (Users)
 */
public enum UserErrorMessages {
  USER_NOT_EXIST_EMAIL("El usuario con email %s no existe"),
  USER_NOT_EXIST_ID("El usuario con ID %s no existe"),
  USER_NOT_EXIST_IN_TENANT("El usuario no está asociado al tenant"),
  USER_AUTHENTICATION_INVALID("Error en la autentificación del usuario."),
  USER_ALREADY_DEACTIVATED("El usuario %s ya fue desactivado"),
  USER_BAD_CREDENTIALS("Credenciales incorrectas"),
  LAST_OWNER_CANNOT_BE_DEACTIVATED("El último dueño no puede ser desactivado"),
  SELF_DEACTIVATION_NOT_ALLOWED("Un usuario no puede desactivarse a sí mismo"),
  CANNOT_MODIFY_OWNER_ROLE("El rol de un usuario OWNER no puede ser modificado"),
  SELF_ROLE_MODIFICATION_NOT_ALLOWED("Un usuario no puede modificar su propio rol"),
  USER_ALREADY_EXISTS_IN_TENANT("El usuario %s ya existe en el tenant");

  private final String template;

  UserErrorMessages(String template) {
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
