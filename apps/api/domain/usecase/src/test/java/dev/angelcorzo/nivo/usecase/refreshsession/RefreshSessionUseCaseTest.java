package dev.angelcorzo.nivo.usecase.refreshsession;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.model.authentication.AuthResponse;
import dev.angelcorzo.nivo.model.authentication.exceptions.TokenInvalidException;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationGateway;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.exceptions.UserNotExistsInTenantException;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("RefreshSessionUseCase Tests")
class RefreshSessionUseCaseTest {
  @Mock private AuthenticationGateway authenticationGateway;
  @Mock private UsersRepository usersRepository;
  @InjectMocks private RefreshSessionUseCase refreshSessionUseCase;

  @Nested
  @DisplayName("Happy Path - Successful Refresh")
  class HappyPath {

    @Test
    @DisplayName("Should return new tokens when refresh token is valid and user exists")
    void shouldReturnNewTokensWhenRefreshTokenIsValid() {
      // Arrange (Given)
      String validRefreshToken = "valid-refresh-token";
      UUID userId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();

      Map<String, String> claims =
          Map.of("sub", userId.toString(), "tenantId", tenantId.toString());

      Users mockUser =
          Users.builder()
              .id(userId)
              .tenant(TenantReference.builder().id(UUID.randomUUID()).companyName("test company").build())
              .build();

      doNothing().when(authenticationGateway).validateToken(validRefreshToken);
      when(authenticationGateway.extractTokenClaims(validRefreshToken)).thenReturn(claims);
      when(usersRepository.findByIdAndTenantId(userId, tenantId)).thenReturn(Optional.of(mockUser));
      when(authenticationGateway.generateAccessToken(any())).thenReturn("new-access-token");
      when(authenticationGateway.generateRefreshToken(any())).thenReturn("new-refresh-token");

      // Act (When)
      AuthResponse authResponse = refreshSessionUseCase.refreshAccessToken(validRefreshToken);

      // Assert (Then)
      assertThat(authResponse).isNotNull();
      assertThat(authResponse.accessToken()).isEqualTo("new-access-token");
      assertThat(authResponse.refreshToken()).isEqualTo("new-refresh-token");

      verify(authenticationGateway).validateToken(validRefreshToken);
      verify(authenticationGateway).extractTokenClaims(validRefreshToken);
      verify(usersRepository).findByIdAndTenantId(userId, tenantId);
      verify(authenticationGateway).generateAccessToken(any());
      verify(authenticationGateway).generateRefreshToken(any());
    }
  }

  @Nested
  @DisplayName("Validation & Error Cases")
  class ValidationAndErrorCases {

    @Test
    @DisplayName("Should throw TokenInvalidException when refresh token is invalid")
    void shouldThrowExceptionWhenTokenIsInvalid() {
      // Arrange
      String invalidToken = "invalid-token";
      doThrow(new TokenInvalidException("Invalid"))
          .when(authenticationGateway)
          .validateToken(invalidToken);

      // Act & Assert
      assertThatThrownBy(() -> refreshSessionUseCase.refreshAccessToken(invalidToken))
          .isInstanceOf(TokenInvalidException.class);

      verify(usersRepository, never()).findByIdAndTenantId(any(), any());
    }

    @Test
    @DisplayName("Should throw UserNotExistsInTenantException when user from token is not found")
    void shouldThrowExceptionWhenUserIsNotFound() {
      // Arrange
      String validTokenWithNonExistentUser = "valid-token-non-existent-user";
      UUID userId = UUID.randomUUID();
      UUID tenantId = UUID.randomUUID();
      Map<String, String> claims =
          Map.of("sub", userId.toString(), "tenantId", tenantId.toString());

      doNothing().when(authenticationGateway).validateToken(validTokenWithNonExistentUser);
      when(authenticationGateway.extractTokenClaims(validTokenWithNonExistentUser))
          .thenReturn(claims);
      when(usersRepository.findByIdAndTenantId(userId, tenantId)).thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(
              () -> refreshSessionUseCase.refreshAccessToken(validTokenWithNonExistentUser))
          .isInstanceOf(UserNotExistsInTenantException.class);

      verify(authenticationGateway, never()).generateAccessToken(any());
      verify(authenticationGateway, never()).generateRefreshToken(any());
    }
  }
}
