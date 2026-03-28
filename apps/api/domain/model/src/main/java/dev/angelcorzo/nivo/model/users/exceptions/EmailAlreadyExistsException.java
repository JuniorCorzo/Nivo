package dev.angelcorzo.nivo.model.users.exceptions;

/**
 * Thrown when attempting to create a user with an email that already exists.
 *
 * <p><strong>Layer:</strong> Domain</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public final class EmailAlreadyExistsException extends IllegalArgumentException {
    public EmailAlreadyExistsException(final String email) {
        super(String.format("El email %s ya existe", email));
    }
}
