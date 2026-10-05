package dev.angelcorzo.nivo.domain.usecase.slot;

import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.slots.valueobject.SlotSummary;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
public class ListSlotsSummaryUseCase {
  private final SlotsRepository slotsRepository;

  public List<SlotSummary> execute(UUID parkingLotId) {
    return this.slotsRepository.findAllSummaryByParkingLotsId(parkingLotId);
  }
}
