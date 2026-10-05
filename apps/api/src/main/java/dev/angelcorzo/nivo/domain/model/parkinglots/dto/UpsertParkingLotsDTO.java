package dev.angelcorzo.nivo.domain.model.parkinglots.dto;

import dev.angelcorzo.nivo.domain.model.parkinglots.Address;
import dev.angelcorzo.nivo.domain.model.parkinglots.Coordinates;
import dev.angelcorzo.nivo.domain.model.parkinglots.OperatingHours;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotPolicy;

import java.util.List;
import java.util.UUID;

import dev.angelcorzo.nivo.domain.model.slots.valueobject.CreatedSlots;
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
    List<CreatedSlots> slots,
    ParkingLotPolicy policy) {

  public UpsertParkingLotsDTO(
      UUID id,
      String name,
      Address address,
      Coordinates coordinates,
      String timezone,
      String currency,
      OperatingHours operatingHours,
      List<CreatedSlots> slots) {
    this(id, name, address, coordinates, timezone, currency, operatingHours, slots, ParkingLotPolicy.defaults());
  }
}
