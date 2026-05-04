package dev.angelcorzo.nivo.usecase.updateparking;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.dto.UpsertParkingLotsDTO;
import dev.angelcorzo.nivo.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.usecase.batchupsertslots.BatchUpsertSlotsUseCase;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class UpdateParkingLotsUseCase {
  private final ParkingLotsRepository parkingLotsRepository;
  private final BatchUpsertSlotsUseCase batchUpsertSlotsUseCase;
  private final AuthenticationContextGateway authenticationContext;

  public ParkingLots update(final UpsertParkingLotsDTO command) {
    if (!this.parkingLotsRepository.existsById(command.id()))
      throw new ParkingNotExistsException(command.id());

    ParkingLots parking = this.buildParkingLot(command);
    parking = this.parkingLotsRepository.save(parking);

    if (command.slots() != null && !command.slots().isEmpty()) {
      this.batchUpsertSlotsUseCase.execute(
          command.slots(), parking, this.authenticationContext.getCurrentTenant());
    }

    return parking;
  }

  public ParkingLots buildParkingLot(UpsertParkingLotsDTO parking) {
    return this.parkingLotsRepository.findById(parking.id())
        .orElseThrow(() -> new ParkingNotExistsException(parking.id()))
        .toBuilder()
        .address(parking.address())
        .coordinates(parking.coordinates())
        .currency(parking.currency())
        .name(parking.name())
        .timezone(parking.timezone())
        .operatingHours(parking.operatingHours())
        .build();
  }
}
