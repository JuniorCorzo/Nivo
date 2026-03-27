package dev.angelcorzo.nivo.model.authentication;

/**
 * Represents the response of a successful authentication operation.
 * <p>
 * This record is an immutable data carrier that holds the access token and the
 * refresh token generated after a user logs in. It is typically returned by
 * authentication use cases and then mapped to a DTO in the entry point layer.
 * </p>
 *
 * @param accessToken  the JWT access token for authorizing API requests.
 * @param refreshToken the JWT refresh token for obtaining a new access token.
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-29
 */
public record AuthResponse(String accessToken, String refreshToken) {

    /**
     * Factory method to create a new {@code AuthResponse} instance.
     * <p>
     * This method provides a convenient way to instantiate the record.
     * </p>
     *
     * @param accessToken  the access token.
     * @param refreshToken the refresh token.
     * @return a new instance of {@code AuthResponse}.
     */
    public static AuthResponse of(String accessToken, String refreshToken) {
        return new AuthResponse(accessToken, refreshToken);
    }
}