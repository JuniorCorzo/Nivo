package dev.angelcorzo.nivo.api.parkinglots.dto;

import jakarta.validation.constraints.NotBlank;

public record AddressDTO(
    @NotBlank String street,
    @NotBlank String city,
    @NotBlank String state,
    @NotBlank String country,
    @NotBlank String zipCode) {}
