package dev.angelcorzo.nivo.model.parkinglots.valueobject;

import dev.angelcorzo.nivo.model.parkinglots.Address;
import dev.angelcorzo.nivo.model.parkinglots.OperatingHours;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import lombok.Builder;

import java.util.UUID;

@Builder
public record ParkingLotsReference(
    UUID id,
    String name,
    Address address,
    String timezone,
    String currency,
    OperatingHours operatingHours) {
  public static ParkingLotsReference of(ParkingLots parkingLots) {
    return new ParkingLotsReference(
        parkingLots.getId(),
        parkingLots.getName(),
        parkingLots.getAddress(),
        parkingLots.getTimezone(),
        parkingLots.getCurrency(),
        parkingLots.getOperatingHours());
  }
}
