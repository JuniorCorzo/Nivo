package dev.angelcorzo.nivo.domain.model.users.exceptions;

import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;
import dev.angelcorzo.nivo.domain.model.commons.exceptions.ErrorMessagesModel;

/**
 * Thrown when a user attempts to modify their own role.
 *
 * <p>
 * <strong>Layer:</strong> Domain
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public class SelfRoleModificationNotAllowedException extends AppException {
  private static final int STATUS = 403;
  private static final String CODE = "SELF_ROLE_MODIFICATION_NOT_ALLOWED";

  public SelfRoleModificationNotAllowedException() {
    super(ErrorMessagesModel.SELF_ROLE_MODIFICATION_NOT_ALLOWED.toString(), STATUS, CODE);
  }

  public SelfRoleModificationNotAllowedException(final String message) {
    super(message, STATUS, CODE);
  }
}
