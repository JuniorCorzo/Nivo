package dev.angelcorzo.nivo.usecase.validatetoken;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationGateway;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ValidateAccessTokenUseCase {
  private final AuthenticationGateway authenticationGateway;

  public void validate(String accessToken) {
     this.authenticationGateway.validateToken(accessToken);
  }
}
