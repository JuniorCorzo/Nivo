package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.request;

import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.commons.AddressDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.commons.CoordinatesDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.commons.OperatingHoursDTO;
import dev.angelcorzo.nivo.infrastructure.entrypoint.rest.slot.dto.CreatedSlots;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.Builder;

@Builder(toBuilder = true)
@Schema(requiredProperties = { "name", "address", "coordinates", "timezone", "currency", "operatingHours" })
public record UpsertParkingLotsRequest(
    UUID id,
    @NotBlank String name,
    @Valid AddressDTO address,
    @Valid CoordinatesDTO coordinates,
    @Pattern(regexp = "^UTC([+-]([0-9]{1,2}|1[0-4])(:[0-5][0-9])?)?$") String timezone,
    @NotBlank String currency,
    @Valid OperatingHoursDTO operatingHours,
    @Valid List<CreatedSlots> slots,
    Integer gracePeriodMinutes,
    BigDecimal gracePeriodPrice,
    BigDecimal ivaRate) {
}
