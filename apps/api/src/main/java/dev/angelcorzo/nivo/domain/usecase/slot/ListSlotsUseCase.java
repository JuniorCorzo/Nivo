package dev.angelcorzo.nivo.domain.usecase.slot;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
public class ListSlotsUseCase {
  private final SlotsRepository slotsRepository;

  public List<Slots> execute(UUID parkingLotId) {
    return this.slotsRepository.findAllByParkingLotsId(parkingLotId);
  }
}
