package dev.angelcorzo.nivo.api.parkinglots.dto;

import java.util.List;
import java.util.UUID;

import dev.angelcorzo.nivo.api.slot.dto.CreatedSlots;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
    @Valid List<CreatedSlots> slots) {
}
