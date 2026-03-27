package dev.angelcorzo.nivo.api.parkinglots.dto;


import lombok.Builder;

import java.util.UUID;

@Builder(toBuilder = true)
public record ParkingLotsInfo(
    UUID id,
    String name,
    AddressDTO address,
    String timezone,
    String currency,
    OperatingHoursDTO operatingHours) {}
