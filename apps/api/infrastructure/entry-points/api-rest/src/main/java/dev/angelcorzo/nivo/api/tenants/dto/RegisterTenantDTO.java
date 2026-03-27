package dev.angelcorzo.nivo.api.tenants.dto;

import dev.angelcorzo.nivo.api.users.dto.CreatedUserDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder(toBuilder = true)
public record RegisterTenantDTO(@NotEmpty String companyName, @Valid @NotNull CreatedUserDTO user) {}
