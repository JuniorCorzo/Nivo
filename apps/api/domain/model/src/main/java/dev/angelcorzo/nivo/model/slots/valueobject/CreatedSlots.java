package dev.angelcorzo.nivo.model.slots.valueobject;

import dev.angelcorzo.nivo.model.slots.enums.SlotType;

public record CreatedSlots(
		String prefix,
		String zone,
		SlotType slotType,
		Integer numberSlots,
		int currentNumberSlots
){

	public CreatedSlots(String prefix, String zone, SlotType slotType, Integer numberSlots, int currentNumberSlots) {
		this.prefix = prefix;
		this.zone = zone;
		this.slotType = slotType;
		this.numberSlots = numberSlots;
		this.currentNumberSlots = currentNumberSlots;
	}

	public CreatedSlots(Integer numberSlots, SlotType slotType, String zone, String prefix) {
		this(prefix, zone, slotType, numberSlots, 0);
	}
}