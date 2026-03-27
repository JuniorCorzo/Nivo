package dev.angelcorzo.nivo.usecase.login;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import dev.angelcorzo.nivo.model.authentication.AuthResponse;
import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationGateway;
import dev.angelcorzo.nivo.model.tenants.Tenants;
import dev.angelcorzo.nivo.model.tenants.valueobject.TenantReference;
import dev.angelcorzo.nivo.model.users.Users;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import dev.angelcorzo.nivo.model.users.gateways.PasswordEncodeGateway;
import dev.angelcorzo.nivo.model.users.gateways.UsersRepository;
import dev.angelcorzo.nivo.usecase.registertenant.exceptions.BadCredentialsException;

import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("LoginUseCase Tests")
class LoginUseCaseTest {

  private UsersRepository usersRepository;
  private AuthenticationGateway authenticationGateway;
  private PasswordEncodeGateway passwordEncode;

  private LoginUseCase loginUseCase;

  @BeforeEach
  void setUp() {
    usersRepository = mock(UsersRepository.class);
    authenticationGateway = mock(AuthenticationGateway.class);
    passwordEncode = mock(PasswordEncodeGateway.class);

    loginUseCase = new LoginUseCase(usersRepository, authenticationGateway, passwordEncode);
  }

  @Nested
  @DisplayName("Happy Path - Successful Login")
  class HappyPath {

    @Test
    @DisplayName("Should return AuthResponse when credentials are valid")
    void shouldReturnAuthResponseWhenCredentialsAreValid() {
      // Arrange
      LoginUseCase.UserCredentials credentials =
          new LoginUseCase.UserCredentials("test@example.com", "password");
      Users user =
          Users.builder()
              .id(UUID.randomUUID())
              .email("test@example.com")
              .password("encodedPassword")
              .tenant(TenantReference.builder().id(UUID.randomUUID()).companyName("Test Company").build())
              .role(Roles.OWNER)
              .build();

      when(usersRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
      when(passwordEncode.matches("encodedPassword", "password")).thenReturn(true);
      when(authenticationGateway.generateAccessToken(anyMap())).thenReturn("accessToken");
      when(authenticationGateway.generateRefreshToken(anyMap())).thenReturn("refreshToken");

      // Act
      AuthResponse authResponse = loginUseCase.auth(credentials);

      // Assert
      assertThat(authResponse).isNotNull();
      assertThat(authResponse.accessToken()).isEqualTo("accessToken");
      assertThat(authResponse.refreshToken()).isEqualTo("refreshToken");
    }
  }

  @Nested
  @DisplayName("Validation & Error Cases")
  class ValidationAndErrorCases {

    @Test
    @DisplayName("Should throw BadCredentialsException when email does not exist")
    void shouldThrowBadCredentialsExceptionWhenEmailDoesNotExist() {
      // Arrange
      LoginUseCase.UserCredentials credentials =
          new LoginUseCase.UserCredentials("test@example.com", "password");
      when(usersRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

      // Act & Assert
      assertThatThrownBy(() -> loginUseCase.auth(credentials))
          .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when password does not match")
    void shouldThrowBadCredentialsExceptionWhenPasswordDoesNotMatch() {
      // Arrange
      LoginUseCase.UserCredentials credentials =
          new LoginUseCase.UserCredentials("test@example.com", "password");
      Users user =
          Users.builder()
              .id(UUID.randomUUID())
              .email("test@example.com")
              .password("encodedPassword")
              .build();

      when(usersRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
      when(passwordEncode.matches("encodedPassword", "password")).thenReturn(false);

      // Act & Assert
      assertThatThrownBy(() -> loginUseCase.auth(credentials))
          .isInstanceOf(BadCredentialsException.class);
    }
  }
}
