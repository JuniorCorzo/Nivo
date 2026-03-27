package dev.angelcorzo.nivo.usecase.refreshsession;

import dev.angelcorzo.nivo.model.authentication.AuthResponse;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationGateway;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.exceptions.UserNotExistsInTenantException;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.usecase.helpers.JwtClaimsFactory;
import java.util.Map;
import java.util.UUID;

import lombok.RequiredArgsConstructor;

/**
 * Use case for refreshing a user's authentication session.
 * <p>
 * This use case takes a valid refresh token, validates it, and if successful,
 * generates a new pair of access and refresh tokens. This allows users to
 * maintain their session without needing to re-enter their credentials.
 * </p>
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-29
 */
@RequiredArgsConstructor
public class RefreshSessionUseCase {

    private final AuthenticationGateway authenticationGateway;
    private final UsersRepository usersRepository;

    /**
     * Refreshes an authentication session using a refresh token.
     *
     * @param refreshToken the refresh token provided by the user.
     * @return a new {@link AuthResponse} containing a new access token and a new refresh token.
     * @throws UserNotExistsInTenantException if the user identified by the token does not exist.
     * @throws dev.angelcorzo.nivo.model.authentication.exceptions.SecurityException if the refresh token is invalid or expired.
     */
    public AuthResponse refreshAccessToken(String refreshToken) {
        this.validate(refreshToken);

        final Map<String, String> claims = this.authenticationGateway.extractTokenClaims(refreshToken);
        final UUID userId = UUID.fromString(claims.get("sub"));
        final UUID tenantId = UUID.fromString(claims.get("tenantId"));

        final Users user =
                this.usersRepository
                        .findByIdAndTenantId(userId, tenantId)
                        .orElseThrow(UserNotExistsInTenantException::new);

        final Map<String, String> accessTokenClaims = JwtClaimsFactory.buildAccessTokenClaims(user);
        final Map<String, String> refreshTokenClaims = JwtClaimsFactory.buildRefreshTokenClaims(user);

        final String newAccessToken = this.authenticationGateway.generateAccessToken(accessTokenClaims);
        final String newRefreshToken =
                this.authenticationGateway.generateRefreshToken(refreshTokenClaims);

        return AuthResponse.of(newAccessToken, newRefreshToken);
    }

    /**
     * Validates the integrity and expiration of the refresh token.
     *
     * @param refreshToken the token to validate.
     */
    private void validate(String refreshToken) {
        this.authenticationGateway.validateToken(refreshToken);
    }
}
