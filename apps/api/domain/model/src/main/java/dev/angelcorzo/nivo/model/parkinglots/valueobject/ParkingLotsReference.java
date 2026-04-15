package dev.angelcorzo.nivo.model.parkinglots.valueobject;

import dev.angelcorzo.nivo.model.parkinglots.Address;
import dev.angelcorzo.nivo.model.parkinglots.Coordinates;
import dev.angelcorzo.nivo.model.parkinglots.OperatingHours;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import lombok.Builder;

import java.util.UUID;

@Builder
public record ParkingLotsReference(
    UUID id,
    String name,
    Address address,
    Coordinates coordinates,
    String timezone,
    String currency,
    OperatingHours operatingHours) {
  public static ParkingLotsReference of(ParkingLots parkingLots) {
    return new ParkingLotsReference(
        parkingLots.getId(),
        parkingLots.getName(),
        parkingLots.getAddress(),
        parkingLots.getCoordinates(),
        parkingLots.getTimezone(),
        parkingLots.getCurrency(),
        parkingLots.getOperatingHours());
  }
}
