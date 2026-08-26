package dev.angelcorzo.nivo.api.security.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import dev.angelcorzo.nivo.model.authentication.exceptions.ExpiredTokenException;
import dev.angelcorzo.nivo.model.authentication.exceptions.TokenInvalidException;
import dev.angelcorzo.nivo.model.users.UserAuthentication;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.usecase.validatetoken.ValidateAccessTokenUseCase;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

@DisplayName("CustomJwtAuthenticationConverter Tests")
class CustomJwtAuthenticationConverterTest {

  private ValidateAccessTokenUseCase validateAccessTokenUseCase;
  private CustomJwtAuthenticationConverter converter;

  @BeforeEach
  void setUp() {
    validateAccessTokenUseCase = mock(ValidateAccessTokenUseCase.class);
    converter = new CustomJwtAuthenticationConverter(validateAccessTokenUseCase);
  }

  private Jwt createJwt(String tokenValue, String sub, String tenantId, String role) {
    Jwt.Builder builder =
        Jwt.withTokenValue(tokenValue)
            .header("alg", "RS256")
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600));

    if (sub != null) builder.subject(sub);
    if (tenantId != null) builder.claim("tenantId", tenantId);
    if (role != null) builder.claim("role", role);

    return builder.build();
  }

  @Nested
  @DisplayName("Happy Path")
  class HappyPath {

    @Test
    @DisplayName("Should convert valid JWT with ROLE_ prefix to AuthenticationToken")
    void shouldConvertValidJwtWithRolePrefix() {
      // Arrange
      UUID userId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      Jwt jwt = createJwt("mock-token-value", userId.toString(), tenantId.toString(), "ROLE_OPERATOR");

      // Act
      AbstractAuthenticationToken token = converter.convert(jwt);

      // Assert
      assertThat(token).isNotNull();
      assertThat(token.isAuthenticated()).isTrue();
      assertThat(token.getAuthorities())
          .containsExactly(new SimpleGrantedAuthority("ROLE_OPERATOR"));

      UserAuthentication principal = (UserAuthentication) token.getPrincipal();
      assertThat(principal.userId()).isEqualTo(userId);
      assertThat(principal.tenantId()).isEqualTo(tenantId);
      assertThat(principal.role()).isEqualTo(Roles.OPERATOR);

      verify(validateAccessTokenUseCase).validate("mock-token-value");
    }

    @Test
    @DisplayName("Should convert valid JWT without ROLE_ prefix")
    void shouldConvertValidJwtWithoutRolePrefix() {
      // Arrange
      UUID userId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      Jwt jwt = createJwt("mock-token-value", userId.toString(), tenantId.toString(), "OWNER");

      // Act
      AbstractAuthenticationToken token = converter.convert(jwt);

      // Assert
      UserAuthentication principal = (UserAuthentication) token.getPrincipal();
      assertThat(principal.role()).isEqualTo(Roles.OWNER);
    }
  }

  @Nested
  @DisplayName("Validation & Error Cases")
  class ErrorCases {

    @Test
    @DisplayName("Should propagate ExpiredTokenException when use case validation fails")
    void shouldPropagateExpiredTokenException() {
      // Arrange
      Jwt jwt = createJwt("expired-token", UUID.randomUUID().toString(), UUID.randomUUID().toString(), "ROLE_DRIVER");
      doThrow(new ExpiredTokenException()).when(validateAccessTokenUseCase).validate("expired-token");

      // Act & Assert
      assertThatThrownBy(() -> converter.convert(jwt))
          .isInstanceOf(ExpiredTokenException.class);
    }

    @Test
    @DisplayName("Should throw TokenInvalidException when subject (userId) is missing")
    void shouldThrowWhenSubjectMissing() {
      Jwt jwt = createJwt("token", null, UUID.randomUUID().toString(), "ROLE_OPERATOR");

      assertThatThrownBy(() -> converter.convert(jwt))
          .isInstanceOf(TokenInvalidException.class);
    }

    @Test
    @DisplayName("Should throw TokenInvalidException when tenantId claim is missing")
    void shouldThrowWhenTenantIdMissing() {
      Jwt jwt = createJwt("token", UUID.randomUUID().toString(), null, "ROLE_OPERATOR");

      assertThatThrownBy(() -> converter.convert(jwt))
          .isInstanceOf(TokenInvalidException.class);
    }

    @Test
    @DisplayName("Should throw TokenInvalidException when role claim is missing")
    void shouldThrowWhenRoleMissing() {
      Jwt jwt = createJwt("token", UUID.randomUUID().toString(), UUID.randomUUID().toString(), null);

      assertThatThrownBy(() -> converter.convert(jwt))
          .isInstanceOf(TokenInvalidException.class);
    }
  }
}
