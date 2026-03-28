package dev.angelcorzo.nivo.model.authentication.exceptions;

/**
 * Base class for all security-related exceptions in the domain layer.
 * <p>
 * This abstract class serves as the root for a hierarchy of exceptions that
 * represent authentication and authorization errors. By extending {@link RuntimeException},
 * these exceptions are unchecked, which is suitable for security violations that
 * often represent programming errors or unrecoverable client-side issues.
 * </p>
 * <p>
 * Subclasses should provide specific contexts for security failures, such as
 * invalid tokens, expired sessions, or insufficient permissions.
 * </p>
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-29
 */
public abstract class SecurityException extends RuntimeException {

  /**
   * Constructs a new security exception with the specified detail message.
   *
   * @param message the detail message. The detail message is saved for
   *                later retrieval by the {@link #getMessage()} method.
   */
  protected SecurityException(String message) {
    super(message);
  }

  /**
   * Constructs a new security exception with the specified detail message and cause.
   * <p>Note that the detail message associated with {@code cause} is <i>not</i>
   * automatically incorporated in this runtime exception's detail message.</p>
   *
   * @param message the detail message (which is saved for later retrieval
   *                by the {@link #getMessage()} method).
   * @param cause   the cause (which is saved for later retrieval by the
   *                {@link #getCause()} method). (A {@code null} value is
   *                permitted, and indicates that the cause is nonexistent or unknown.)
   */
  protected SecurityException(String message, Throwable cause) {
    super(message, cause);
  }
}
