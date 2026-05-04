package dev.angelcorzo.nivo.usecase.deleteparkinglot;

import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class DeleteParkingLotUseCase {

  private final ParkingLotsRepository parkingLotsRepository;
  private final SlotsRepository slotsRepository;

  public void execute(UUID parkingId) {
    ParkingLots parkingLot =
        parkingLotsRepository
            .findById(parkingId)
            .orElseThrow(() -> new ParkingNotExistsException(parkingId));

    slotsRepository.softDeleteByParkingLotsId(parkingId);

    parkingLotsRepository.delete(parkingLot);
  }
}
