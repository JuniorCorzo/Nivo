package dev.angelcorzo.nivo.model.users.exceptions;

/**
 * Thrown when attempting to add a user to a tenant where they already exist.
 *
 * <p><strong>Layer:</strong> Domain</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

public class UserAlreadyExistsInTenantException extends AppException {
  private static final int STATUS = 409;
  private static final String CODE = "USER_ALREADY_EXISTS_IN_TENANT";

  public UserAlreadyExistsInTenantException(String email) {
    super(String.format("El usuario %s ya existe en el tenant", email), STATUS, CODE);
  }
}
