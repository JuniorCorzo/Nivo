package dev.angelcorzo.nivo.securitycore.jwt;

import dev.angelcorzo.nivo.model.authentication.exceptions.ExpiredTokenException;
import dev.angelcorzo.nivo.model.authentication.exceptions.MalformedTokenException;
import dev.angelcorzo.nivo.model.authentication.exceptions.TokenInvalidException;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationGateway;
import dev.angelcorzo.nivo.model.commons.exceptions.TokenErrorMessages;
import dev.angelcorzo.nivo.securitycore.jwt.config.JwtProperties;
import dev.angelcorzo.nivo.securitycore.jwt.config.RSAProperties;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

/**
 * JWT provider implementing the AuthenticationGateway interface.
 *
 * <p>This class provides a concrete implementation for generating, validating, and extracting
 * claims from JWT tokens. It handles both signed (JWS) and encrypted (JWE) tokens, using RSA keys
 * for cryptographic operations.
 *
 * <p>This provider is part of the infrastructure layer and depends on the domain layer through the
 * {@link AuthenticationGateway} interface, following the Dependency Inversion Principle of Clean
 * Architecture.
 *
 * @author Angel Corzo
 * @version 1.0
 * @since 2025-10-30
 * @see AuthenticationGateway
 * @see JwtProperties
 * @see RSAProperties
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class JwtProvider implements AuthenticationGateway {

  private final JwtProperties jwtProperties;
  private final RSAProperties rsaProperties;
  private final RSAPrivateKey privateKey;
  private final RSAPublicKey publicKey;

  /**
   * {@inheritDoc}
   *
   * <p>This implementation generates a signed JWT (JWS) using the RS256 algorithm. The token
   * includes standard claims such as issuer, expiration time, and issued-at, along with custom
   * claims provided in the method argument.
   */
  @Override
  public String generateAccessToken(Map<String, String> claims) {
    Instant expiredTime = Instant.now().plusSeconds(jwtProperties.getAccessTokenExpiration());

    return Jwts.builder()
        .header()
        .type("JWT")
        .keyId(rsaProperties.getKeyId())
        .and()
        .issuer(jwtProperties.getIssue())
        .expiration(Date.from(expiredTime))
        .notBefore(Date.from(Instant.now()))
        .issuedAt(new Date())
        .claims(claims)
        .signWith(privateKey, Jwts.SIG.RS256)
        .compact();
  }

  /**
   * {@inheritDoc}
   *
   * <p>This implementation generates an encrypted JWT (JWE) using RSA-OAEP-256 for key encryption
   * and A256GCM for content encryption. This ensures that the token's payload is confidential.
   */
  @Override
  public String generateRefreshToken(Map<String, String> claims) {
    final Date expiredTime =
        Date.from(Instant.now().plusSeconds(jwtProperties.getRefreshTokenExpiration()));

    return Jwts.builder()
        .header()
        .keyId(rsaProperties.getKeyId())
        .and()
        .issuer(jwtProperties.getIssue())
        .issuedAt(new Date())
        .expiration(expiredTime)
        .notBefore(new Date())
        .claims(claims)
        .encryptWith(publicKey, Jwts.KEY.RSA_OAEP_256, Jwts.ENC.A256GCM)
        .compact();
  }

  /**
   * {@inheritDoc}
   *
   * <p>This method determines whether the token is a JWS (3 parts) or a JWE (5 parts) and calls the
   * appropriate private method to extract the claims.
   *
   * @throws MalformedTokenException if the token format is invalid.
   */
  @Override
  public Map<String, String> extractTokenClaims(String token) {
    final int tokenParts = token.split("\\.").length;

    return switch (tokenParts) {
      case 3 -> this.extractClaims(token);
      case 5 -> this.extractEncryptedClaims(token);
      default -> throw new MalformedTokenException();
    };
  }

  /** {@inheritDoc} */
  @Override
  public Optional<String> extractClaim(String token, String claimName) {
    return Optional.of(this.extractTokenClaims(token).get(claimName));
  }

  /** {@inheritDoc} */
  @Override
  public Optional<String> extractEmail(String token) {
    return Optional.of(this.extractTokenClaims(token).get("email"));
  }

  /**
   * {@inheritDoc}
   *
   * <p>This implementation validates the signature of the access token and ensures that essential
   * claims (subject, tenantId, role) are present. It handles various exceptions related to token
   * validation, such as expiration or malformation, and wraps them in domain-specific exceptions.
   *
   * @throws ExpiredTokenException if the token has expired.
   * @throws MalformedTokenException if the token is structurally invalid.
   * @throws TokenInvalidException if the token signature is invalid or required claims are missing.
   */
  @Override
  public void validateToken(String accessToken) {
    try {
      final Map<String, String> claims = this.extractTokenClaims(accessToken);

      if (claims.isEmpty()
          || claims.get("sub") == null
          || claims.get("tenantId") == null
          || (claims.get("purpose").equals("access-token") && claims.get("role") == null))
        throw new TokenInvalidException(TokenErrorMessages.INVALID_TOKEN.toString());

    } catch (ExpiredJwtException e) {
      log.warn("Token expired: {}", e.getMessage());
      throw new ExpiredTokenException();
    } catch (MalformedJwtException e) {
      log.warn("Malformed token: {}", e.getMessage());
      throw new MalformedTokenException(e);
    } catch (UnsupportedJwtException | SecurityException | IllegalArgumentException e) {
      log.warn("Invalid token: {}", e.getMessage());
      throw new TokenInvalidException(TokenErrorMessages.INVALID_TOKEN.toString(), e);
    }
  }

  /**
   * Extracts claims from a signed JWT (JWS).
   *
   * @param token the JWS token string.
   * @return a map of claims.
   */
  private Map<String, String> extractClaims(String token) {
    return Jwts.parser()
        .verifyWith(publicKey)
        .build()
        .parseSignedClaims(token)
        .getPayload()
        .entrySet()
        .stream()
        .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().toString()));
  }

  /**
   * Extracts claims from an encrypted JWT (JWE).
   *
   * @param token the JWE token string.
   * @return a map of claims.
   */
  private Map<String, String> extractEncryptedClaims(String token) {
    return Jwts.parser()
        .decryptWith(privateKey)
        .build()
        .parseEncryptedClaims(token)
        .getPayload()
        .entrySet()
        .stream()
        .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().toString()));
  }
}
