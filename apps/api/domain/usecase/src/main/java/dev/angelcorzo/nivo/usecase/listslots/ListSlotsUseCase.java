package dev.angelcorzo.nivo.usecase.listslots;

import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
public class ListSlotsUseCase {
  private final SlotsRepository slotsRepository;

  public List<Slots> execute(UUID parkingLotId){
    return slotsRepository.findAllByParkingLotsId(parkingLotId);
  }
}
