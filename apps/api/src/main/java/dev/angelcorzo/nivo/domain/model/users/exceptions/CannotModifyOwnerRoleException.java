package dev.angelcorzo.nivo.domain.model.users.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;

/**
 * Thrown when an attempt is made to modify the role of an OWNER or SUPERADMIN user.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public class CannotModifyOwnerRoleException extends AppException {
  private static final int STATUS = 403;
  private static final String CODE = "CANNOT_MODIFY_OWNER_ROLE";

  public CannotModifyOwnerRoleException() {
    super("El rol de un usuario OWNER o SUPERADMIN no puede ser modificado", STATUS, CODE);
  }

  public CannotModifyOwnerRoleException(String message) {
    super(message, STATUS, CODE);
  }
}
