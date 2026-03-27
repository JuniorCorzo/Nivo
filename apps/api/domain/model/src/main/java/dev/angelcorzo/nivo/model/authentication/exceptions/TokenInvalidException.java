package dev.angelcorzo.nivo.model.authentication.exceptions;

/**
 * Exception thrown when a JWT token is considered invalid for reasons other than expiration or malformation.
 * <p>
 * This exception can be used for a variety of scenarios, such as:
 * <ul>
 *     <li>The token's signature is invalid.</li>
 *     <li>The token contains claims that are not recognized or are invalid.</li>
 *     <li>The token is not yet valid (e.g., the 'nbf' claim is in the future).</li>
 * </ul>
 * It is a subclass of {@link SecurityException} and is typically caught at the security filter level.
 * </p>
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-29
 * @see SecurityException
 */
public class TokenInvalidException extends SecurityException {

	/**
	 * Constructs a new {@code TokenInvalidException} with the specified detail message.
	 *
	 * @param message the detail message.
	 */
	public TokenInvalidException(String message) {
    super(message);
	}

	/**
	 * Constructs a new {@code TokenInvalidException} with the specified detail message and cause.
	 *
	 * @param message the detail message.
	 * @param cause   the underlying cause of the exception.
	 */
	public TokenInvalidException(String message, Throwable cause) {
		super(message, cause);
	}
}
