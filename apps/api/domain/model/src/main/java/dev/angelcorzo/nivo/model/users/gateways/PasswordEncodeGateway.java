package dev.angelcorzo.nivo.model.users.gateways;

/**
 * Gateway interface for password encoding and verification.
 * <p>
 * This interface defines the contract for password hashing services, abstracting the
 * specific implementation details of the hashing algorithm. It is part of the domain
 * layer, ensuring that the business logic is not tied to a specific security provider.
 * </p>
 * <p>
 * Implementations of this gateway in the infrastructure layer will typically wrap a
 * library like BCrypt, SCrypt, or Argon2.
 * </p>
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-29
 */
public interface PasswordEncodeGateway {

    /**
     * Encodes the given raw password into a hash.
     *
     * @param rawPassword the password to encode.
     * @return the hashed password.
     */
    String encrypt(String rawPassword);

    /**
     * Verifies that a raw password matches an encoded password.
     *
     * @param rawPassword       the raw password to verify.
     * @param passwordEncrypted the encoded password to match against.
     * @return {@code true} if the passwords match, {@code false} otherwise.
     */
    boolean matches(String rawPassword, String passwordEncrypted);
}
