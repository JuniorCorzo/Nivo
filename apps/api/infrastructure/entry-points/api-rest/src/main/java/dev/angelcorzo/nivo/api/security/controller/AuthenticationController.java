package dev.angelcorzo.nivo.api.security.controller;

import dev.angelcorzo.nivo.api.commons.dto.Response;
import dev.angelcorzo.nivo.api.security.dto.AuthenticationResponseDTO;
import dev.angelcorzo.nivo.api.security.dto.UserCredentialsDTO;
import dev.angelcorzo.nivo.api.security.mapper.AuthenticationMapper;
import dev.angelcorzo.nivo.model.authentication.AuthResponse;
import dev.angelcorzo.nivo.usecase.login.LoginUseCase;
import dev.angelcorzo.nivo.usecase.refreshsession.RefreshSessionUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {
  private final int refreshTokenExpiration;

  private final LoginUseCase loginUseCase;
  private final RefreshSessionUseCase refreshSessionUseCase;
  private final AuthenticationMapper authenticationMapper;

  public AuthenticationController(
      @Value("${jwt.refresh-token-expiration}") int refreshTokenExpiration,
      LoginUseCase loginUseCase,
      RefreshSessionUseCase refreshSessionUseCase,
      AuthenticationMapper authenticationMapper) {
    this.refreshTokenExpiration = refreshTokenExpiration;
    this.loginUseCase = loginUseCase;
    this.refreshSessionUseCase = refreshSessionUseCase;
    this.authenticationMapper = authenticationMapper;
  }

  @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
  Response<AuthenticationResponseDTO> login(
      @RequestBody UserCredentialsDTO userCredentials, HttpServletResponse response) {
    AuthResponse authResponse =
        this.loginUseCase.auth(this.authenticationMapper.toModel(userCredentials));

    final Cookie refreshTokenCookie =
        this.getCookie(authResponse.refreshToken(), refreshTokenExpiration);
    response.addCookie(refreshTokenCookie);

    return Response.ok(this.authenticationMapper.toDTO(authResponse), "Login successful");
  }

  @Operation(security = {@SecurityRequirement(name = "refreshToken")})
  @PostMapping(value = "/refresh", produces = MediaType.APPLICATION_JSON_VALUE)
  Response<AuthenticationResponseDTO> refreshSession(
      @CookieValue("refreshToken") String refreshToken, HttpServletResponse response) {
    AuthResponse newTokens = this.refreshSessionUseCase.refreshAccessToken(refreshToken);

    final Cookie refreshTokenCookie =
        this.getCookie(newTokens.refreshToken(), refreshTokenExpiration);
    response.addCookie(refreshTokenCookie);

    return Response.ok(this.authenticationMapper.toDTO(newTokens), "Refresh successful");
  }

  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.OK)
  void logout(HttpServletResponse response) {
    final Cookie refreshTokenCookie = this.getCookie(null, 0);
    response.addCookie(refreshTokenCookie);
  }

  private Cookie getCookie(String refreshToken, int expiredTime) {
    final Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
    refreshTokenCookie.setHttpOnly(true);
    refreshTokenCookie.setMaxAge(expiredTime);
    refreshTokenCookie.setPath("/");

    return refreshTokenCookie;
  }
}
