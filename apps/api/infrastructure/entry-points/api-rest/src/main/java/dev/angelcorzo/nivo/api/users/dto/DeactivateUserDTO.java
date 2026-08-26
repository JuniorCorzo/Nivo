package dev.angelcorzo.nivo.api.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Builder;

@Builder
@Schema(description = "Payload to deactivate a user")
public record DeactivateUserDTO(
    @Schema(description = "ID of the user to deactivate", example = "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID userId,

    @Schema(description = "ID of the user performing the deactivation", example = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID deactivatedBy,

    @Schema(description = "Tenant ID", example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID tenantId,

    @Schema(description = "Reason for deactivation", example = "Employee left the company")
    String reason) {}

