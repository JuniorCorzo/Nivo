package dev.angelcorzo.nivo.api.security.controller;

import dev.angelcorzo.nivo.api.commons.dto.Response;
import dev.angelcorzo.nivo.api.security.dto.AuthenticationResponseDTO;
import dev.angelcorzo.nivo.api.security.dto.UserCredentialsDTO;
import dev.angelcorzo.nivo.api.security.mapper.AuthenticationMapper;
import dev.angelcorzo.nivo.model.authentication.AuthResponse;
import dev.angelcorzo.nivo.usecase.login.LoginUseCase;
import dev.angelcorzo.nivo.usecase.refreshsession.RefreshSessionUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
  private final LoginUseCase loginUseCase;
  private final RefreshSessionUseCase refreshSessionUseCase;
  private final AuthenticationMapper authenticationMapper;

  @PostMapping("/login")
  Response<AuthenticationResponseDTO> login(@RequestBody UserCredentialsDTO userCredentials) {
    AuthResponse authResponse =
        this.loginUseCase.auth(this.authenticationMapper.toModel(userCredentials));
    return Response.ok(this.authenticationMapper.toDTO(authResponse), "Login successful");
  }

  @PostMapping("/refresh/{refreshToken}")
  Response<AuthenticationResponseDTO> refreshSession(
      @PathVariable("refreshToken") String refreshToken) {
    AuthResponse newTokens = this.refreshSessionUseCase.refreshAccessToken(refreshToken);

    return Response.ok(this.authenticationMapper.toDTO(newTokens), "Refresh successful");
  }
}
