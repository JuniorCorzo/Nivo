package dev.angelcorzo.nivo.domain.model.users.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;

/**
 * Thrown when a user attempts to modify their own role.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public class SelfRoleModificationNotAllowedException extends AppException {
  private static final int STATUS = 403;
  private static final String CODE = "SELF_ROLE_MODIFICATION_NOT_ALLOWED";

  public SelfRoleModificationNotAllowedException() {
    super("Un usuario no puede modificar su propio rol", STATUS, CODE);
  }

  public SelfRoleModificationNotAllowedException(String message) {
    super(message, STATUS, CODE);
  }
}
