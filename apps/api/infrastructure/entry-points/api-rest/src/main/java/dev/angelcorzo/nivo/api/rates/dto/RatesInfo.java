package dev.angelcorzo.nivo.api.rates.dto;

import dev.angelcorzo.nivo.api.specialpolicies.dto.SpecialPoliciesInfo;
import dev.angelcorzo.nivo.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.model.rates.enums.VehicleType;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
public record RatesInfo(
    UUID id,
    String name,
    String description,
    BigDecimal pricePerUnit,
    TimeUnitsRate timeUnit,
    String minChargeTimeMinutes,
    VehicleType vehicleType,
    SpecialPoliciesInfo specialPolicy) {}
