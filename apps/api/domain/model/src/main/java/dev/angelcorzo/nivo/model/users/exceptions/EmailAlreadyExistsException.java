package dev.angelcorzo.nivo.model.users.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.AppException;

/**
 * Thrown when attempting to create a user with an email that already exists.
 *
 * <p><strong>Layer:</strong> Domain
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public final class EmailAlreadyExistsException extends AppException {
  public EmailAlreadyExistsException(final String email) {
    super(String.format("El email %s ya existe", email), 409, "EMAIL_ALREADY_EXISTS");
  }
}
