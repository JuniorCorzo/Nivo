package dev.angelcorzo.nivo.api.security.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(description = "User login credentials payload")
public record UserCredentialsDTO(
    @Schema(description = "User email address", example = "admin@nivo.com", requiredMode = Schema.RequiredMode.REQUIRED)
    @Email
    @NotEmpty
    String email,

    @Schema(description = "User password", example = "Password123!", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty
    String password) {}

