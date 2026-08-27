package dev.angelcorzo.nivo.api.tenants.dto;

import dev.angelcorzo.nivo.api.users.dto.CreatedUserDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(description = "Payload to register a new tenant organization and its owner")
public record RegisterTenantDTO(
    @Schema(description = "Company or business name", example = "Nivo Parking Corp", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty String companyName,

    @Schema(description = "Owner user details", requiredMode = Schema.RequiredMode.REQUIRED)
    @Valid @NotNull CreatedUserDTO user) {}

