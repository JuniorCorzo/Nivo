package dev.angelcorzo.nivo.api.specialpolicies.dto;

import dev.angelcorzo.nivo.api.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.model.specialpolicies.enums.OperationsTypes;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(description = "Special policy details (discount or surcharge)")
public record SpecialPoliciesDTO(
    @Schema(description = "Special policy ID", example = "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44")
    UUID id,

    @Schema(description = "Tenant information")
    TenantInfo tenant,

    @Schema(description = "Policy name", example = "Weekend Discount")
    String name,

    @Schema(description = "Type of modification", example = "PERCENTAGE")
    ModifiesTypes modifies,

    @Schema(description = "Operation type", example = "DISCOUNT")
    OperationsTypes operation,

    @Schema(description = "Modification value", example = "15.00")
    BigDecimal valueToModify,

    @Schema(description = "Whether the policy is currently active", example = "true")
    boolean active,

    @Schema(description = "Creation timestamp")
    OffsetDateTime createdAt,

    @Schema(description = "Last update timestamp")
    OffsetDateTime updatedAt) {}

