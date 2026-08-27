package dev.angelcorzo.nivo.api.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;

@Builder
@Schema(description = "Payload to complete user creation upon accepting an invitation")
public record CreatedUserDTO(
    @Schema(description = "Full name of the user", example = "John Doe", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty
    String fullName,

    @Schema(description = "User email address", example = "john.doe@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty
    @Email
    String email,

    @Schema(description = "User password", example = "StrongP@ss123", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty
    String password,

    @Schema(description = "User contact phone / info", example = "+1234567890", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty
    String contactInfo
) {}

