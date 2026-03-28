package dev.angelcorzo.nivo.api.users.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.UUID;
import lombok.Builder;

@Builder
public record DeactivateUserDTO(
    @NotEmpty UUID userId, @NotEmpty UUID deactivatedBy, @NotEmpty UUID tenantId, String reason) {}
