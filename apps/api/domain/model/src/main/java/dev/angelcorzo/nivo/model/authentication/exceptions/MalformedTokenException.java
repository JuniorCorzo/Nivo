package dev.angelcorzo.nivo.model.authentication.exceptions;

import dev.angelcorzo.nivo.model.commons.exceptions.TokenErrorMessages;

/**
 * Exception thrown when a JWT token is structurally invalid.
 *
 * <p>This exception indicates that the token does not conform to the expected format of a JSON Web
 * Token (e.g., it does not have the three parts separated by dots). It is a subclass of {@link
 * SecurityException} and is typically caught at the security filter level to return an
 * authentication error to the client.
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-29
 * @see SecurityException
 * @see TokenErrorMessages
 */
public class MalformedTokenException extends SecurityException {

  /**
   * Constructs a new {@code MalformedTokenException} with the default error message.
   *
   * <p>The default message is retrieved from {@link TokenErrorMessages#MALFORMED_TOKEN}.
   */
  public MalformedTokenException() {
    super(TokenErrorMessages.MALFORMED_TOKEN.getMessage());
  }

  /**
   * Constructs a new {@code MalformedTokenException} with the specified cause.
   *
   * <p>This constructor is useful for wrapping lower-level exceptions that may occur during token
   * parsing, while providing a standard error message.
   *
   * @param cause the underlying cause of the exception
   */
  public MalformedTokenException(Throwable cause) {
    super(TokenErrorMessages.MALFORMED_TOKEN.getMessage(), cause);
  }

  /**
   * Constructs a new {@code MalformedTokenException} with a custom message.
   *
   * <p>While it is recommended to use the standardized error messages from {@link
   * TokenErrorMessages}, this constructor allows for providing a more specific message in special
   * cases.
   *
   * @param message the detail message
   */
  public MalformedTokenException(String message) {
    super(message);
  }
}
