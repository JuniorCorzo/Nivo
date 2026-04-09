package dev.angelcorzo.nivo.api.users.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.angelcorzo.nivo.api.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;

@Schema(
    requiredMode = Schema.RequiredMode.REQUIRED,
    requiredProperties = {
      "id",
      "fullName",
      "email",
      "role",
      "tenant",
      "contactInfo",
      "createdAt",
      "updatedAt"
    })
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
public record UserDTO(
    UUID id,
    String fullName,
    String email,
    Roles role,
    TenantInfo tenant,
    String contactInfo,
    UUID deletedBy,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    OffsetDateTime deletedAt) {}
