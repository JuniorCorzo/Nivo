package dev.angelcorzo.nivo.usecase.getcurrentuser;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.users.Users;
import lombok.RequiredArgsConstructor;

/**
 * Use case for retrieving the currently authenticated user's profile.
 *
 * <p>This class delegates to the {@link AuthenticationContextGateway} to resolve the
 * authenticated user from the security context and return their full domain entity.
 *
 * <p><strong>Layer:</strong> Application (Use Case)
 *
 * <p><strong>Responsibility:</strong> To provide the current user's profile information.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see AuthenticationContextGateway
 */
@RequiredArgsConstructor
public class GetCurrentUserUseCase {
  private final AuthenticationContextGateway authenticationContextGateway;

  /**
   * Retrieves the currently authenticated user.
   *
   * @return The {@link Users} entity of the authenticated user.
   */
  public Users execute() {
    return authenticationContextGateway.getCurrentUser();
  }
}
