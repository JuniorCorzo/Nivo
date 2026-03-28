package dev.angelcorzo.nivo.model.parkinglots.valueobject;

import dev.angelcorzo.nivo.model.parkinglots.Address;
import dev.angelcorzo.nivo.model.parkinglots.OperatingHours;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import java.util.UUID;

public record ParkingLotsReference(
    UUID id,
    String name,
    Address address,
    Integer totalSpots,
    String timezone,
    String currency,
    OperatingHours operatingHours) {
  public static ParkingLotsReference of(ParkingLots parkingLots) {
    return new ParkingLotsReference(
        parkingLots.getId(),
        parkingLots.getName(),
        parkingLots.getAddress(),
        parkingLots.getTotalSpots(),
        parkingLots.getTimezone(),
        parkingLots.getCurrency(),
        parkingLots.getOperatingHours());
  }
}
