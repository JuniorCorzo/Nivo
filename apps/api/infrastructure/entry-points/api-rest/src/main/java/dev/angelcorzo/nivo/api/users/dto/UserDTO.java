package dev.angelcorzo.nivo.api.users.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.angelcorzo.nivo.api.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;

@Schema(description = "User profile details")
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
public record UserDTO(
    @Schema(description = "Unique user ID", example = "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33")
    UUID id,

    @Schema(description = "Full name", example = "John Doe")
    String fullName,

    @Schema(description = "Email address", example = "john.doe@example.com")
    String email,

    @Schema(description = "Assigned user role", example = "MANAGER")
    Roles role,

    @Schema(description = "Tenant information")
    TenantInfo tenant,

    @Schema(description = "Contact phone or details", example = "+1234567890")
    String contactInfo,

    @Schema(description = "ID of user who deleted this account (if deactivated)")
    UUID deletedBy,

    @Schema(description = "Creation timestamp")
    OffsetDateTime createdAt,

    @Schema(description = "Last update timestamp")
    OffsetDateTime updatedAt,

    @Schema(description = "Deactivation timestamp (if deactivated)")
    OffsetDateTime deletedAt) {}

