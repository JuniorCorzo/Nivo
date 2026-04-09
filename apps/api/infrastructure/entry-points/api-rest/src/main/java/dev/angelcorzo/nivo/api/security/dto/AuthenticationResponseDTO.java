package dev.angelcorzo.nivo.api.security.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Schema(requiredProperties = {"accessToken", "refreshToken"})
@Builder(toBuilder = true)
public record AuthenticationResponseDTO(String accessToken, String refreshToken) {}
