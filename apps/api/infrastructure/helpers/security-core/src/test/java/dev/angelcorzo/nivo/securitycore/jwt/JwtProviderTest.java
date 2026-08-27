package dev.angelcorzo.nivo.securitycore.jwt;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dev.angelcorzo.nivo.model.authentication.exceptions.ExpiredTokenException;
import dev.angelcorzo.nivo.model.authentication.exceptions.MalformedTokenException;
import dev.angelcorzo.nivo.model.authentication.exceptions.TokenInvalidException;
import dev.angelcorzo.nivo.securitycore.jwt.config.JwtProperties;
import dev.angelcorzo.nivo.securitycore.jwt.config.RSAProperties;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("JwtProvider Tests")
class JwtProviderTest {

  private static RSAPrivateKey privateKey;
  private static RSAPublicKey publicKey;
  private static RSAPrivateKey differentPrivateKey;
  private static RSAPublicKey differentPublicKey;

  private JwtProperties jwtProperties;
  private RSAProperties rsaProperties;
  private JwtProvider jwtProvider;

  @BeforeAll
  static void generateKeys() throws Exception {
    KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
    kpg.initialize(2048);

    KeyPair kp = kpg.generateKeyPair();
    privateKey = (RSAPrivateKey) kp.getPrivate();
    publicKey = (RSAPublicKey) kp.getPublic();

    KeyPair differentKp = kpg.generateKeyPair();
    differentPrivateKey = (RSAPrivateKey) differentKp.getPrivate();
    differentPublicKey = (RSAPublicKey) differentKp.getPublic();
  }

  @BeforeEach
  void setUp() {
    jwtProperties = new JwtProperties();
    jwtProperties.setIssue("nivo-auth-test");
    jwtProperties.setAccessTokenExpiration(3600L); // 1 hour
    jwtProperties.setRefreshTokenExpiration(86400L); // 24 hours

    rsaProperties = new RSAProperties();
    rsaProperties.setKeyId("test-rsa-key-id");

    jwtProvider = new JwtProvider(jwtProperties, rsaProperties, privateKey, publicKey);
  }

  @Nested
  @DisplayName("Access Token (JWS) Generation & Extraction")
  class AccessTokenTests {

    @Test
    @DisplayName("Should generate signed access token and extract claims correctly")
    void shouldGenerateAndExtractSignedAccessToken() {
      // Arrange
      UUID userId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      Map<String, String> claims = Map.of(
          "sub", userId.toString(),
          "email", "user@test.com",
          "tenantId", tenantId.toString(),
          "role", "OWNER",
          "purpose", "access-token"
      );

      // Act
      String token = jwtProvider.generateAccessToken(claims);

      // Assert
      assertThat(token).isNotBlank();
      assertThat(token.split("\\.")).hasSize(3); // JWS has 3 parts

      Map<String, String> extracted = jwtProvider.extractTokenClaims(token);
      assertThat(extracted.get("sub")).isEqualTo(userId.toString());
      assertThat(extracted.get("email")).isEqualTo("user@test.com");
      assertThat(extracted.get("tenantId")).isEqualTo(tenantId.toString());
      assertThat(extracted.get("role")).isEqualTo("OWNER");
      assertThat(extracted.get("iss")).isEqualTo("nivo-auth-test");
    }

    @Test
    @DisplayName("Should extract single claim and email via helper methods")
    void shouldExtractSingleClaimAndEmail() {
      // Arrange
      Map<String, String> claims = Map.of(
          "sub", "user-123",
          "email", "developer@nivo.app",
          "tenantId", "tenant-456",
          "role", "MANAGER",
          "purpose", "access-token"
      );
      String token = jwtProvider.generateAccessToken(claims);

      // Act
      Optional<String> email = jwtProvider.extractEmail(token);
      Optional<String> sub = jwtProvider.extractClaim(token, "sub");

      // Assert
      assertThat(email).isPresent().contains("developer@nivo.app");
      assertThat(sub).isPresent().contains("user-123");
    }
  }

  @Nested
  @DisplayName("Refresh Token (JWE) Generation & Extraction")
  class RefreshTokenTests {

    @Test
    @DisplayName("Should generate encrypted refresh token and extract claims correctly")
    void shouldGenerateAndExtractEncryptedRefreshToken() {
      // Arrange
      UUID userId = UUID.randomUUID();
      Map<String, String> claims = Map.of(
          "sub", userId.toString(),
          "purpose", "refresh-token",
          "tenantId", UUID.randomUUID().toString()
      );

      // Act
      String token = jwtProvider.generateRefreshToken(claims);

      // Assert
      assertThat(token).isNotBlank();
      assertThat(token.split("\\.")).hasSize(5); // JWE has 5 parts

      Map<String, String> extracted = jwtProvider.extractTokenClaims(token);
      assertThat(extracted.get("sub")).isEqualTo(userId.toString());
      assertThat(extracted.get("purpose")).isEqualTo("refresh-token");
    }
  }

  @Nested
  @DisplayName("Token Validation")
  class TokenValidationTests {

    @Test
    @DisplayName("Should pass validation for a valid access token with all required claims")
    void shouldValidateValidAccessTokenSuccessfully() {
      Map<String, String> claims = Map.of(
          "sub", UUID.randomUUID().toString(),
          "tenantId", UUID.randomUUID().toString(),
          "role", "OPERATOR",
          "purpose", "access-token"
      );
      String token = jwtProvider.generateAccessToken(claims);

      // Act & Assert - does not throw
      jwtProvider.validateToken(token);
    }

    @Test
    @DisplayName("Should throw TokenInvalidException when sub claim is missing")
    void shouldThrowWhenSubClaimIsMissing() {
      Map<String, String> claims = new HashMap<>();
      claims.put("tenantId", UUID.randomUUID().toString());
      claims.put("role", "OPERATOR");
      claims.put("purpose", "access-token");
      String token = jwtProvider.generateAccessToken(claims);

      assertThatThrownBy(() -> jwtProvider.validateToken(token))
          .isInstanceOf(TokenInvalidException.class);
    }

    @Test
    @DisplayName("Should throw TokenInvalidException when tenantId claim is missing")
    void shouldThrowWhenTenantIdClaimIsMissing() {
      Map<String, String> claims = new HashMap<>();
      claims.put("sub", UUID.randomUUID().toString());
      claims.put("role", "OPERATOR");
      claims.put("purpose", "access-token");
      String token = jwtProvider.generateAccessToken(claims);

      assertThatThrownBy(() -> jwtProvider.validateToken(token))
          .isInstanceOf(TokenInvalidException.class);
    }

    @Test
    @DisplayName("Should throw TokenInvalidException when role claim is missing on access-token")
    void shouldThrowWhenRoleClaimIsMissingOnAccessToken() {
      Map<String, String> claims = new HashMap<>();
      claims.put("sub", UUID.randomUUID().toString());
      claims.put("tenantId", UUID.randomUUID().toString());
      claims.put("purpose", "access-token");
      String token = jwtProvider.generateAccessToken(claims);

      assertThatThrownBy(() -> jwtProvider.validateToken(token))
          .isInstanceOf(TokenInvalidException.class);
    }

    @Test
    @DisplayName("Should throw ExpiredTokenException when token is expired")
    void shouldThrowExpiredTokenException() {
      // Configure negative expiration so it is already expired
      jwtProperties.setAccessTokenExpiration(-10L);
      JwtProvider expiredProvider =
          new JwtProvider(jwtProperties, rsaProperties, privateKey, publicKey);

      Map<String, String> claims = Map.of(
          "sub", UUID.randomUUID().toString(),
          "tenantId", UUID.randomUUID().toString(),
          "role", "OPERATOR",
          "purpose", "access-token"
      );
      String token = expiredProvider.generateAccessToken(claims);

      assertThatThrownBy(() -> jwtProvider.validateToken(token))
          .isInstanceOf(ExpiredTokenException.class);
    }

    @Test
    @DisplayName("Should throw TokenInvalidException when token was signed by a different key")
    void shouldThrowTokenInvalidExceptionWhenSignedByDifferentKey() {
      JwtProvider untrustedProvider =
          new JwtProvider(jwtProperties, rsaProperties, differentPrivateKey, differentPublicKey);

      Map<String, String> claims = Map.of(
          "sub", UUID.randomUUID().toString(),
          "tenantId", UUID.randomUUID().toString(),
          "role", "OPERATOR",
          "purpose", "access-token"
      );
      String token = untrustedProvider.generateAccessToken(claims);

      // Verifying with our publicKey must fail
      assertThatThrownBy(() -> jwtProvider.validateToken(token))
          .isInstanceOf(TokenInvalidException.class);
    }

    @Test
    @DisplayName("Should throw MalformedTokenException on invalid token structure")
    void shouldThrowMalformedTokenExceptionOnInvalidToken() {
      assertThatThrownBy(() -> jwtProvider.extractTokenClaims("not.a.valid.jwt.token.format.here"))
          .isInstanceOf(MalformedTokenException.class);

      assertThatThrownBy(() -> jwtProvider.validateToken("abc.123"))
          .isInstanceOf(MalformedTokenException.class);
    }
  }
}
