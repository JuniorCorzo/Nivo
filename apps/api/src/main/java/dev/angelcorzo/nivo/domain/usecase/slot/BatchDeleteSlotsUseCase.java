package dev.angelcorzo.nivo.domain.usecase.slot;

import java.util.List;
import java.util.UUID;

import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class BatchDeleteSlotsUseCase {
  private final SlotsRepository slotRepository;

  public void execute(List<UUID> slotIds) {
    this.slotRepository.batchDelete(slotIds);
  }
}
