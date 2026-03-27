package dev.angelcorzo.nivo.model.authentication.gateway;

import java.util.Map;
import java.util.Optional;

public interface AuthenticationGateway {

  String generateAccessToken(Map<String, String> claims);

  String generateRefreshToken(Map<String, String> claims);

  Map<String, String> extractTokenClaims(String token);

  Optional<String> extractClaim(String token, String claimName);

  Optional<String> extractEmail(String token);

  void validateToken(String accessToken);
}
