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
import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class UserNotExistsInTenantException extends AppException {
  private static final int STATUS = 404;
  private static final String CODE = "USER_NOT_FOUND_IN_TENANT";

  public UserNotExistsInTenantException() {
    super(ErrorMessagesModel.USER_NOT_EXIST_IN_TENANT.toString(), STATUS, CODE);
  }
}
