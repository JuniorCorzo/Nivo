package dev.angelcorzo.nivo.api.specialpolicies.dto;

import dev.angelcorzo.nivo.model.specialpolicies.enums.ModifiesTypes;
import dev.angelcorzo.nivo.model.specialpolicies.enums.OperationsTypes;
import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder(toBuilder = true)
public record CreateSpecialPolicies(
    @NotEmpty String name,
    @NotNull ModifiesTypes modifies,
    @NotNull OperationsTypes operation,
    @Min(value = 0) BigDecimal valueToModify) {}
