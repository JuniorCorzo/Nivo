package dev.angelcorzo.nivo.model.users.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.ErrorMessagesModel;
import java.util.UUID;

/**
 * Thrown when an operation is attempted on a user who is already in a deactivated state.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class UserAlreadyDeactivatedException extends AppException {
  private static final int STATUS = 409;
  private static final String CODE = "USER_ALREADY_DEACTIVATED";

  public UserAlreadyDeactivatedException(UUID id) {
    super(ErrorMessagesModel.USER_ALREADY_DEACTIVATED.format(id), STATUS, CODE);
  }
}
