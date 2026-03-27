package dev.angelcorzo.nivo.api.rates.dto;

import dev.angelcorzo.nivo.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.model.rates.enums.VehicleType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
public record UpdateRate(
    @org.hibernate.validator.constraints.UUID UUID id,
    @NotEmpty String name,
    @NotEmpty String description,
    @Min(value = 0) BigDecimal pricePerUnit,
    @NotNull TimeUnitsRate timeUnit,
    @NotNull String minChargeTimeMinutes,
    @NotNull VehicleType vehicleType) {}
