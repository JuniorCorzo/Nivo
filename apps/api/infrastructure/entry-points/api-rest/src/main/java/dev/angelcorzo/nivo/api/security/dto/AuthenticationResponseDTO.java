package dev.angelcorzo.nivo.api.security.dto;

import lombok.Builder;

@Builder(toBuilder = true)
public record AuthenticationResponseDTO(String accessToken, String refreshToken) {}
