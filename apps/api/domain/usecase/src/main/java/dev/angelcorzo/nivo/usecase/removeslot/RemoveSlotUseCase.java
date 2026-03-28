package dev.angelcorzo.nivo.usecase.removeslot;

import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.parkinglots.valueobject.ParkingLotsReference;
import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.excetions.SlotNotFoundException;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class RemoveSlotUseCase {
  private final SlotsRepository slotsRepository;
  private final ParkingLotsRepository parkingLotsRepository;

  public void execute(UUID id) {
    final UUID parkingLotId =
        this.slotsRepository
            .findById(id)
            .map(Slots::getParking)
            .map(ParkingLotsReference::id)
            .orElseThrow(() -> new SlotNotFoundException(id));

    this.slotsRepository.deleteById(id);
    this.parkingLotsRepository.decrementTotalSpots(parkingLotId);
  }
}
