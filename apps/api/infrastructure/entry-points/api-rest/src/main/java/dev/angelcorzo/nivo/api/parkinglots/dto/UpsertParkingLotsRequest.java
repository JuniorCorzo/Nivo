package dev.angelcorzo.nivo.api.parkinglots.dto;

import dev.angelcorzo.nivo.model.parkinglots.dto.UpsertParkingLotsDTO;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
    @Valid List<CreatedSlots> slots) {

  @Schema(requiredProperties = "slotType")
  public record CreatedSlots(String prefix, String zone, SlotType slotType, @Min(1) Integer numberSlots) {
  }
}
