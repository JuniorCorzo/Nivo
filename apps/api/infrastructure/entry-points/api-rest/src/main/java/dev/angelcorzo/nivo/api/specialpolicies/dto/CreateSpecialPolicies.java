package dev.angelcorzo.nivo.api.specialpolicies.dto;

import dev.angelcorzo.nivo.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.model.specialpolicies.enums.OperationsTypes;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(description = "Payload to create a special policy (discount or surcharge)")
public record CreateSpecialPolicies(
    @Schema(description = "Name of the special policy", example = "Weekend Discount", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotEmpty String name,

    @Schema(description = "Type of modification (e.g. PERCENTAGE, FIXED_AMOUNT)", example = "PERCENTAGE", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull ModifiesTypes modifies,

    @Schema(description = "Operation type (e.g. DISCOUNT, SURCHARGE)", example = "DISCOUNT", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull OperationsTypes operation,

    @Schema(description = "Value to apply for modification", example = "15.00", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull @Min(value = 0) BigDecimal valueToModify) {}

