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
public class LastOwnerCannotBeDeactivatedException extends RuntimeException {
  public LastOwnerCannotBeDeactivatedException() {
    super(ErrorMessagesModel.LAST_OWNER_CANNOT_BE_DEACTIVATED.toString());
  }
}
