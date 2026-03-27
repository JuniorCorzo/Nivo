package dev.angelcorzo.nivo.model.users.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;

/**
 * Thrown when a user who exists globally cannot be found within the context of a specific tenant.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public class UserNotExistsInTenantException extends RuntimeException {
  public UserNotExistsInTenantException() {
    super(ErrorMessagesModel.USER_NOT_EXIST_IN_TENANT.toString());
  }
}
