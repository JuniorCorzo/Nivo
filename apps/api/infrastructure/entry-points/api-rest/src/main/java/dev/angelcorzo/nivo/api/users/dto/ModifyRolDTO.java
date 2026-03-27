package dev.angelcorzo.nivo.api.users.dto;

import dev.angelcorzo.nivo.model.users.enums.Roles;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;

import java.util.UUID;

@Builder(toBuilder = true)
public record ModifyRolDTO(
    @NotEmpty UUID userId, @NotEmpty Roles newRole, @NotEmpty UUID tenantId) {}
