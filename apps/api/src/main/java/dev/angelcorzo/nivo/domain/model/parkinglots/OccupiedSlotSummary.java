package dev.angelcorzo.nivo.domain.model.parkinglots;

import lombok.Builder;

@Builder(toBuilder = true)
public record OccupiedSlotSummary(
  String slotNumber,
  String zone,
  String prefix,
  String type,
  String licensePlate) {
}
