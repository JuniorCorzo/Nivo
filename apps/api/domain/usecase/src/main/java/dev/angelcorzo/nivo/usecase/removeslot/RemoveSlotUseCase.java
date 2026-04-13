package dev.angelcorzo.nivo.usecase.removeslot;

import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class RemoveSlotUseCase {
  private final SlotsRepository slotsRepository;
  private final ParkingLotsRepository parkingLotsRepository;

  public void execute(UUID id) {
    this.slotsRepository.deleteById(id);
  }
}
