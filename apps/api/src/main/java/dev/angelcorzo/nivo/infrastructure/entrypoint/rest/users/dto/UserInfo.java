package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto;

import dev.angelcorzo.nivo.domain.model.users.enums.Roles;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;
import lombok.Builder;

@Schema(
    requiredMode = Schema.RequiredMode.REQUIRED,
    requiredProperties = {
      "id",
      "fullName",
      "email",
      "role",
      "contactInfo",
    })
@Builder(toBuilder = true)
public record UserInfo(UUID id, String fullName, String email, Roles role, String contactInfo) {}
