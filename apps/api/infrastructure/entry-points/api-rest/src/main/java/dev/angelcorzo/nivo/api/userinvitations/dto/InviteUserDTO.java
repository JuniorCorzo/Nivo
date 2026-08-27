package dev.angelcorzo.nivo.api.userinvitations.dto;

import dev.angelcorzo.nivo.model.users.enums.Roles;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.UUID;

@Builder(toBuilder = true)
@Schema(description = "Payload to invite a user with an assigned role")
public record InviteUserDTO(
    @Schema(description = "User email address", example = "colleague@company.com", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty @Email String email,

    @Schema(description = "Role assigned to the user", example = "OPERATOR", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull Roles role,

    @Schema(description = "Tenant ID", example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID tenantId,

    @Schema(description = "User ID who sent the invitation", example = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull UUID inviteBy) {}

