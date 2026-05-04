package dev.angelcorzo.nivo.usecase.acceptinvitation.exceptions;

import dev.angelcorzo.nivo.model.users.enums.Roles;

/**
 * Thrown when an invitation is created with a role that is not permitted for that invitation type.
 *
 * <p><strong>Layer:</strong> Application (Use Case)</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class InvalidRoleException extends AppException {
  private static final int STATUS = 400;
  private static final String CODE = "INVALID_ROLE";

  public InvalidRoleException(Roles rol) {
    super(String.format("El rol %s no esta permitido en este tipo de invitaciones", rol.toString().toLowerCase()), STATUS, CODE);
  }
}
