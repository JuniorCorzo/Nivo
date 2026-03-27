package dev.angelcorzo.nivo.usecase.login;

import dev.angelcorzo.nivo.model.authentication.AuthResponse;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationGateway;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.gateways.PasswordEncodeGateway;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.usecase.helpers.JwtClaimsFactory;
import dev.angelcorzo.nivo.usecase.registertenant.exceptions.BadCredentialsException;
import java.util.Map;
import lombok.RequiredArgsConstructor;

/**
 * Use case for handling user login and authentication.
 * <p>
 * This use case orchestrates the process of authenticating a user based on their
 * email and password. It validates the credentials, and if successful, generates
 * both an access token and a refresh token.
 * </p>
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-29
 */
@RequiredArgsConstructor
public class LoginUseCase {

    private final UsersRepository userRepository;
    private final AuthenticationGateway authenticationGateway;
    private final PasswordEncodeGateway passwordEncode;

    /**
     * Authenticates a user and returns a set of authentication tokens.
     *
     * @param credentials the user's login credentials (email and password).
     * @return an {@link AuthResponse} containing the access and refresh tokens.
     * @throws BadCredentialsException if the email or password is incorrect.
     */
    public AuthResponse auth(UserCredentials credentials) {
        final Users user =
                this.userRepository
                        .findByEmail(credentials.email())
                        .filter(u -> this.passwordEncode.matches(credentials.password(), u.getPassword()))
                        .orElseThrow(BadCredentialsException::new);

        final Map<String, String> accessTokenClaims = JwtClaimsFactory.buildAccessTokenClaims(user);
        final Map<String, String> refreshTokenClaims = JwtClaimsFactory.buildRefreshTokenClaims(user);

        final String accessToken = this.authenticationGateway.generateAccessToken(accessTokenClaims);
        final String refreshToken = this.authenticationGateway.generateRefreshToken(refreshTokenClaims);

        return AuthResponse.of(accessToken, refreshToken);
    }

    /**
     * A record to hold user credentials for authentication.
     *
     * @param email    the user's email address.
     * @param password the user's raw, unencrypted password.
     */
    public record UserCredentials(String email, String password) {}
}
