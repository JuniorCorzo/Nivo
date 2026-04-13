package dev.angelcorzo.nivo.api.parkinglots.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(requiredProperties = {"street", "city", "state", "country", "zipCode"})
public record AddressDTO(
    @NotBlank String street,
    @NotBlank String city,
    @NotBlank String state,
    @NotBlank String country,
    @NotBlank String zipCode) {}
