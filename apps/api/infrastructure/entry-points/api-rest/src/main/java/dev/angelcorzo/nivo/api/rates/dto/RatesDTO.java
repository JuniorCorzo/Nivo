package dev.angelcorzo.nivo.api.rates.dto;

import dev.angelcorzo.nivo.api.parkinglots.dto.ParkingLotsInfo;
import dev.angelcorzo.nivo.api.specialpolicies.dto.SpecialPoliciesInfo;
import dev.angelcorzo.nivo.api.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.model.rates.enums.VehicleType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record RatesDTO(
    UUID id,
    TenantInfo tenant,
    ParkingLotsInfo parking,
    String name,
    String description,
    BigDecimal pricePerUnit,
    TimeUnitsRate timeUnit,
    String minChargeTimeMinutes,
    VehicleType vehicleType,
    SpecialPoliciesInfo specialPolicy,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    OffsetDateTime deletedAt) {}
