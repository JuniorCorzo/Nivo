package dev.angelcorzo.nivo.model.users.exceptions;

/**
 * Thrown when attempting to add a user to a tenant where they already exist.
 *
 * <p><strong>Layer:</strong> Domain</p>
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
public class UserAlreadyExistsInTenantException extends RuntimeException {
    public UserAlreadyExistsInTenantException(String email) {
        super(String.format("El usuario %s ya existe en el tenant", email));
    }
}
