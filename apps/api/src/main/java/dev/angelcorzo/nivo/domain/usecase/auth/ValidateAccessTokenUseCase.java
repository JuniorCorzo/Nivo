package dev.angelcorzo.nivo.domain.usecase.auth;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationGateway;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ValidateAccessTokenUseCase {
  private final AuthenticationGateway authenticationGateway;

  public void validate(String accessToken) {
     this.authenticationGateway.validateToken(accessToken);
  }
}
