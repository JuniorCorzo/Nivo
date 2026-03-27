package dev.angelcorzo.nivo.api.parkinglots.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.angelcorzo.nivo.api.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.api.users.dto.UserDTO;
import dev.angelcorzo.nivo.api.users.dto.UserInfo;
import lombok.Builder;

import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
public record ParkingLotsResponse(
    UUID id,
    String name,
    AddressDTO address,
    UserInfo owner,
    TenantInfo tenant,
    String timezone,
    String currency,
    OperatingHoursDTO operatingHours) {}
