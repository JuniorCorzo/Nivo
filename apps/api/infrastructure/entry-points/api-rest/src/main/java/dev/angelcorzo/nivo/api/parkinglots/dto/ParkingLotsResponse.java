package dev.angelcorzo.nivo.api.parkinglots.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.angelcorzo.nivo.api.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.api.users.dto.UserInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
@Schema(requiredProperties = { "id", "name", "address", "coordinates", "owner", "tenant", "timezone", "currency",
    "operatingHours", "createdAt", "updatedAt" })
public record ParkingLotsResponse(
    UUID id,
    String name,
    AddressDTO address,
    CoordinatesDTO coordinates,
    UserInfo owner,
    TenantInfo tenant,
    String timezone,
    String currency,
    OperatingHoursDTO operatingHours,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt) {
}
