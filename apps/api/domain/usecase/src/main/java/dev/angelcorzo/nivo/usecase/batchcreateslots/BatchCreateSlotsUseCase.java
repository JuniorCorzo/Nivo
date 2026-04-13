package dev.angelcorzo.nivo.usecase.batchcreateslots;

import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class BatchCreateSlotsUseCase {
	private final SlotsRepository slotsRepository;

	public List<Slots> execute(List<Slots> slotsList) {
		List<Slots> slotsToCreate = new ArrayList<>(slotsList);
		List<Slots> result = new ArrayList<>();
		while (!slotsToCreate.isEmpty()) {
			final List<Slots> lot = slotsToCreate.subList(0, Math.min(50, slotsList.size()));
			result.addAll(this.slotsRepository.saveAllEntities(lot));

			lot.clear();
		}

		return result;
	}
}
