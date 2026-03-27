package dev.angelcorzo.nivo.model.authentication.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.TokenErrorMessages;

/**
 * Exception thrown when a JWT (JSON Web Token) has expired.
 *
 * <p>This exception indicates that the current time is after the expiration time defined in the
 * token's 'exp' claim. It is a subclass of {@link SecurityException} and is typically caught by
 * security filters to signal that the user needs to re-authenticate or refresh their session.
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-29
 * @see SecurityException
 * @see TokenErrorMessages
 */
public class ExpiredTokenException extends SecurityException {

  /**
   * Constructs a new {@code ExpiredTokenException} with a custom message.
   *
   * <p>While it is recommended to use the default constructor which provides a standardized
   * message, this constructor allows for a more specific message in special cases.
   *
   * @param message the detail message.
   */
  public ExpiredTokenException(String message) {
    super(message);
  }

  /**
   * Constructs a new {@code ExpiredTokenException} with the default error message.
   *
   * <p>The default message is retrieved from {@link TokenErrorMessages#EXPIRED_TOKEN}.
   */
  public ExpiredTokenException() {
    super(TokenErrorMessages.EXPIRED_TOKEN.getMessage());
  }
}
