package dev.angelcorzo.nivo.api.parkinglots.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Geographic coordinates using WGS84 (SRID 4326)", requiredProperties = { "latitude",
    "longitude" })
public record CoordinatesDTO(
    Double latitude,
    Double longitude) {
}
