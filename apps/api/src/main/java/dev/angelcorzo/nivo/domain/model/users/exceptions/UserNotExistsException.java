package dev.angelcorzo.nivo.domain.model.users.exceptions;

import java.util.UUID;

/**
 * Thrown when a user cannot be found by their identifier (ID or email).
 *
 * <p><strong>Layer:</strong> Domain
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;

public class UserNotExistsException extends AppException {
  private static final int STATUS = 404;
  private static final String CODE = "USER_NOT_FOUND";

  public UserNotExistsException(UUID id) {
    super(UserErrorMessages.USER_NOT_EXIST_ID.format(id), STATUS, CODE);
  }

  public UserNotExistsException(String email) {
    super(UserErrorMessages.USER_NOT_EXIST_EMAIL.format(email), STATUS, CODE);
  }
}
