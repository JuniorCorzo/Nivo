package dev.angelcorzo.nivo.api.users.dto;

import dev.angelcorzo.nivo.model.users.enums.Roles;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.UUID;

@Builder(toBuilder = true)
@Schema(description = "Payload to modify a user's role")
public record ModifyRolDTO(
    @Schema(description = "Target user ID", example = "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID userId,

    @Schema(description = "New role", example = "MANAGER", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull Roles newRole,

    @Schema(description = "Tenant ID", example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID tenantId) {}

