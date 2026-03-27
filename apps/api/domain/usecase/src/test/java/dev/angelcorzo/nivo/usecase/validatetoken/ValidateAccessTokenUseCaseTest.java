package dev.angelcorzo.nivo.usecase.validatetoken;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import dev.angelcorzo.nivo.model.authentication.exceptions.ExpiredTokenException;
import dev.angelcorzo.nivo.model.authentication.exceptions.MalformedTokenException;
import dev.angelcorzo.nivo.model.authentication.exceptions.TokenInvalidException;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationGateway;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("ValidateAccessTokenUseCase Tests")
class ValidateAccessTokenUseCaseTest {
  @Mock private AuthenticationGateway authenticationGateway;
  @InjectMocks private ValidateAccessTokenUseCase validateAccessTokenUseCase;

  @Nested
  @DisplayName("Happy Path - Casos Exitosos")
  class HappyPath {

    @Test
    @DisplayName("Should call gateway successfully when token is valid")
    void shouldCallGatewaySuccessfullyWhenTokenIsValid() {
      // Arrange (Given): Prepara los datos de entrada
      String validAccessToken = "a-valid-jwt-token";
      // No es necesario un when() para un método void, Mockito no hará nada por defecto.

      // Act (When): Ejecuta el método del caso de uso
      validateAccessTokenUseCase.validate(validAccessToken);

      // Assert (Then): Verifica que el gateway fue invocado con el token correcto
      verify(authenticationGateway).validateToken(validAccessToken);
    }
  }

  @Nested
  @DisplayName("Validation & Error Cases")
  class ValidationAndErrorCases {

    @Test
    @DisplayName("Should propagate ExpiredTokenException when gateway throws it")
    void shouldPropagateExpiredTokenException() {
      // Arrange
      String expiredToken = "an-expired-token";
      doThrow(new ExpiredTokenException()).when(authenticationGateway).validateToken(expiredToken);

      // Act & Assert
      assertThatThrownBy(() -> validateAccessTokenUseCase.validate(expiredToken))
          .isInstanceOf(ExpiredTokenException.class);

      // Verify
      verify(authenticationGateway).validateToken(expiredToken);
    }

    @Test
    @DisplayName("Should propagate MalformedTokenException when gateway throws it")
    void shouldPropagateMalformedTokenException() {
      // Arrange
      String malformedToken = "a-malformed-token";
      doThrow(new MalformedTokenException())
          .when(authenticationGateway)
          .validateToken(malformedToken);

      // Act & Assert
      assertThatThrownBy(() -> validateAccessTokenUseCase.validate(malformedToken))
          .isInstanceOf(MalformedTokenException.class);

      // Verify
      verify(authenticationGateway).validateToken(malformedToken);
    }

    @Test
    @DisplayName("Should propagate TokenInvalidException when gateway throws it")
    void shouldPropagateTokenInvalidException() {
      // Arrange
      String invalidToken = "an-invalid-token-for-other-reasons";
      doThrow(new TokenInvalidException("Invalid signature"))
          .when(authenticationGateway)
          .validateToken(invalidToken);

      // Act & Assert
      assertThatThrownBy(() -> validateAccessTokenUseCase.validate(invalidToken))
          .isInstanceOf(TokenInvalidException.class)
          .hasMessageContaining("Invalid signature");

      // Verify
      verify(authenticationGateway).validateToken(invalidToken);
    }
  }
}
