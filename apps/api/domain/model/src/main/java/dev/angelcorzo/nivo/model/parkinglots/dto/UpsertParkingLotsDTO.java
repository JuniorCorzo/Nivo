package dev.angelcorzo.nivo.model.parkinglots.dto;

import dev.angelcorzo.nivo.model.parkinglots.Address;
import dev.angelcorzo.nivo.model.parkinglots.Coordinates;
import dev.angelcorzo.nivo.model.parkinglots.OperatingHours;

import java.util.List;
import java.util.UUID;

import dev.angelcorzo.nivo.model.rates.enums.VehicleType;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import dev.angelcorzo.nivo.model.slots.valueobject.CreatedSlots;
import lombok.Builder;

@Builder(toBuilder = true)
public record UpsertParkingLotsDTO(
    UUID id,
    String name,
    Address address,
    Coordinates coordinates,
    String timezone,
    String currency,
    OperatingHours operatingHours,
    List<CreatedSlots> slots
    ) {
}
