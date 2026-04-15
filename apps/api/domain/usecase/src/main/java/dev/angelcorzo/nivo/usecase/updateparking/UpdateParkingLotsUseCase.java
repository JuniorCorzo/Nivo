package dev.angelcorzo.nivo.usecase.updateparking;

import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.dto.UpsertParkingLotsDTO;
import dev.angelcorzo.nivo.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class UpdateParkingLotsUseCase {
  private final ParkingLotsRepository parkingLotsRepository;

  public ParkingLots update(final UpsertParkingLotsDTO parking) {
    return this.parkingLotsRepository
        .findById(parking.id())
        .orElseThrow(() -> new ParkingNotExistsException(parking.id()))
        .toBuilder()
        .name(parking.name())
        .operatingHours(parking.operatingHours())
        .currency(parking.currency())
        .address(parking.address())
        .coordinates(parking.coordinates())
        .build();
  }
}
