package dev.angelcorzo.nivo.domain.usecase.slot;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class BatchPersistSlotsUseCase {
  private final SlotsRepository slotsRepository;

  public List<Slots> execute(List<Slots> slots) {
    List<Slots> pending = new ArrayList<>(slots);
    List<Slots> result = new ArrayList<>();

    while (!pending.isEmpty()) {
      List<Slots> batch = pending.subList(0, Math.min(50, pending.size()));
      result.addAll(this.slotsRepository.saveAllEntities(batch));
      batch.clear();
    }

    return result;
  }
}
