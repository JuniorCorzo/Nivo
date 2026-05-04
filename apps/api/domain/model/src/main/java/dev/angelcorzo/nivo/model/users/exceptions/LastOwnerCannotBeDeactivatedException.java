package dev.angelcorzo.nivo.model.users.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;

/**
 * Thrown when an attempt is made to deactivate the last user with an 'OWNER' role in a tenant.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class LastOwnerCannotBeDeactivatedException extends AppException {
  private static final int STATUS = 403;
  private static final String CODE = "LAST_OWNER_CANNOT_BE_DEACTIVATED";

  public LastOwnerCannotBeDeactivatedException() {
    super(ErrorMessagesModel.LAST_OWNER_CANNOT_BE_DEACTIVATED.toString(), STATUS, CODE);
  }
}
