package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.commons.AddressDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.commons.CoordinatesDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.commons.OperatingHoursDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.tenants.dto.TenantInfo;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.users.dto.UserInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
@Schema(requiredProperties = { "id", "name", "address", "coordinates", "owner", "tenant", "timezone", "currency",
    "operatingHours", "createdAt", "updatedAt", "gracePeriodMinutes", "gracePeriodPrice", "ivaRate" })
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
    OffsetDateTime updatedAt,
    Integer gracePeriodMinutes,
    BigDecimal gracePeriodPrice,
    BigDecimal ivaRate) {
}
