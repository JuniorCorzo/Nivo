package dev.angelcorzo.nivo.domain.model.users.exceptions;

/**
 * Thrown when attempting to add a user to a tenant where they already exist.
 *
 * <p><strong>Layer:</strong> Domain</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
import dev.angelcorzo.nivo.domain.model.commons.exceptions.AppException;
import dev.angelcorzo.nivo.domain.model.commons.exceptions.ErrorMessagesModel;

public class UserAlreadyExistsInTenantException extends AppException {
  private static final int STATUS = 409;
  private static final String CODE = "USER_ALREADY_EXISTS_IN_TENANT";

  public UserAlreadyExistsInTenantException(final String email) {
    super(ErrorMessagesModel.USER_ALREADY_EXISTS_IN_TENANT.format(email), STATUS, CODE);
  }
}
