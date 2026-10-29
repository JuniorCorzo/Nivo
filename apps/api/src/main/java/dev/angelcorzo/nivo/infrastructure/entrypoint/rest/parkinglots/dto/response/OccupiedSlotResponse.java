package dev.angelcorzo.nivo.infrastructure.entrypoint.rest.parkinglots.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder(toBuilder = true)
@Schema(description = "Real-time details of an occupied parking bay")
public record OccupiedSlotResponse(
    @Schema(description = "Slot number identifier", example = "A-01")
    String slotNumber,
    @Schema(description = "Zone or floor name", example = "Nivel 1")
    String zone,
    @Schema(description = "Bay prefix", example = "A")
    String prefix,
    @Schema(description = "Vehicle slot type", example = "CAR")
    String type,
    @Schema(description = "License plate of vehicle parked", example = "KLM 482")
    String licensePlate
) {}
