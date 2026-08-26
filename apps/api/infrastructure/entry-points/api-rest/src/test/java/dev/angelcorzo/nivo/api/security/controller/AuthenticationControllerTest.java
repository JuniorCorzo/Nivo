package dev.angelcorzo.nivo.api.security.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.angelcorzo.nivo.api.security.dto.AuthenticationResponseDTO;
import dev.angelcorzo.nivo.api.security.dto.UserCredentialsDTO;
import dev.angelcorzo.nivo.api.security.mapper.AuthenticationMapper;
import dev.angelcorzo.nivo.model.authentication.AuthResponse;
import dev.angelcorzo.nivo.usecase.login.LoginUseCase;
import dev.angelcorzo.nivo.usecase.refreshsession.RefreshSessionUseCase;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
@WebMvcTest(AuthenticationController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = AuthenticationController.class)
@TestPropertySource(properties = "jwt.refresh-token-expiration=86400")
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthenticationController Tests")
class AuthenticationControllerTest {

  @Autowired private MockMvc mockMvc;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @MockitoBean private LoginUseCase loginUseCase;
  @MockitoBean private RefreshSessionUseCase refreshSessionUseCase;
  @MockitoBean private AuthenticationMapper authenticationMapper;

  @Nested
  @DisplayName("POST /auth/login")
  class LoginTests {

    @Test
    @DisplayName("Should return 200 and set-cookie when credentials are valid")
    void shouldLoginSuccessfully() throws Exception {
      // Arrange
      UserCredentialsDTO credentials =
          new UserCredentialsDTO("admin@nivo.app", "Password123!");
      LoginUseCase.UserCredentials modelCredentials =
          new LoginUseCase.UserCredentials("admin@nivo.app", "Password123!");
      AuthResponse authResponse = new AuthResponse("access-token-xyz", "refresh-token-abc");
      AuthenticationResponseDTO responseDTO =
          new AuthenticationResponseDTO("access-token-xyz", "refresh-token-abc");

      when(authenticationMapper.toModel(any(UserCredentialsDTO.class))).thenReturn(modelCredentials);
      when(loginUseCase.auth(modelCredentials)).thenReturn(authResponse);
      when(authenticationMapper.toDTO(authResponse)).thenReturn(responseDTO);

      // Act & Assert
      mockMvc
          .perform(
              post("/auth/login")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(objectMapper.writeValueAsString(credentials)))
          .andExpect(status().isOk())
          .andExpect(header().exists("Set-Cookie"))
          .andExpect(jsonPath("$.data.accessToken").value("access-token-xyz"))
          .andExpect(jsonPath("$.message").value("Login successful"));
    }

    @Test
    @DisplayName("Should return 400 Bad Request when email format is invalid")
    void shouldReturn400WhenEmailIsInvalid() throws Exception {
      UserCredentialsDTO invalidCredentials =
          new UserCredentialsDTO("not-an-email", "Password123!");

      mockMvc
          .perform(
              post("/auth/login")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(objectMapper.writeValueAsString(invalidCredentials)))
          .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should return 400 Bad Request when password is empty")
    void shouldReturn400WhenPasswordIsEmpty() throws Exception {
      UserCredentialsDTO emptyPasswordCredentials =
          new UserCredentialsDTO("admin@nivo.app", "");

      mockMvc
          .perform(
              post("/auth/login")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(objectMapper.writeValueAsString(emptyPasswordCredentials)))
          .andExpect(status().isBadRequest());
    }
  }

  @Nested
  @DisplayName("POST /auth/refresh")
  class RefreshTests {

    @Test
    @DisplayName("Should refresh tokens successfully when valid cookie is provided")
    void shouldRefreshSessionSuccessfully() throws Exception {
      // Arrange
      String refreshToken = "valid-refresh-token";
      AuthResponse newTokens = new AuthResponse("new-access-token", "new-refresh-token");
      AuthenticationResponseDTO responseDTO =
          new AuthenticationResponseDTO("new-access-token", "new-refresh-token");

      when(refreshSessionUseCase.refreshAccessToken(refreshToken)).thenReturn(newTokens);
      when(authenticationMapper.toDTO(newTokens)).thenReturn(responseDTO);

      // Act & Assert
      mockMvc
          .perform(
              post("/auth/refresh")
                  .cookie(new Cookie("refreshToken", refreshToken)))
          .andExpect(status().isOk())
          .andExpect(header().exists("Set-Cookie"))
          .andExpect(jsonPath("$.data.accessToken").value("new-access-token"))
          .andExpect(jsonPath("$.message").value("Refresh successful"));
    }
  }

  @Nested
  @DisplayName("POST /auth/logout")
  class LogoutTests {

    @Test
    @DisplayName("Should return 200 and clear cookie on logout")
    void shouldLogoutSuccessfully() throws Exception {
      mockMvc
          .perform(post("/auth/logout"))
          .andExpect(status().isOk())
          .andExpect(header().exists("Set-Cookie"));
    }
  }
}
