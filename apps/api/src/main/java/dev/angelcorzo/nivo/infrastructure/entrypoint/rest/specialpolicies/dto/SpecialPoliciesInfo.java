package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.specialpolicies.dto;

import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.domain.model.specialpolicies.enums.OperationsTypes;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(
    description = "Special policy information",
    requiredProperties = {
      "id",
      "name",
      "modifies",
      "operation",
      "valueToModify",
      "active"
    })
public record SpecialPoliciesInfo(
    @Schema(description = "Policy ID", example = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", requiredMode = Schema.RequiredMode.REQUIRED)
    UUID id,

    @Schema(description = "Policy name", example = "Night discount", requiredMode = Schema.RequiredMode.REQUIRED)
    String name,

    @Schema(description = "Field modified by the policy", example = "PRICE", requiredMode = Schema.RequiredMode.REQUIRED)
    ModifiesTypes modifies,

    @Schema(description = "Operation type", example = "PERCENTAGE", requiredMode = Schema.RequiredMode.REQUIRED)
    OperationsTypes operation,

    @Schema(description = "Value to modify", example = "10.00", requiredMode = Schema.RequiredMode.REQUIRED)
    BigDecimal valueToModify,

    @Schema(description = "Whether the policy is active", example = "true", requiredMode = Schema.RequiredMode.REQUIRED)
    boolean active) {}
