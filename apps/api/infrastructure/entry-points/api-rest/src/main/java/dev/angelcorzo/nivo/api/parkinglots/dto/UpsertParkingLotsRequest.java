package dev.angelcorzo.nivo.api.parkinglots.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

import jakarta.validation.constraints.Pattern;
import lombok.Builder;

@Builder(toBuilder = true)
public record UpsertParkingLotsRequest(
    UUID id,
    @NotBlank String name,
    @Valid AddressDTO address,
    @Pattern(regexp = "^UTC([+-]([0-9]{1,2}|1[0-4])(:[0-5][0-9])?)?$") String timezone,
    @NotBlank String currency,
    @Valid OperatingHoursDTO operatingHours) {}
