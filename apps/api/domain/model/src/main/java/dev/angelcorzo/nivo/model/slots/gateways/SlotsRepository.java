package dev.angelcorzo.nivo.model.slots.gateways;

import dev.angelcorzo.nivo.model.slots.Slots;
import dev.angelcorzo.nivo.model.slots.valueobject.SlotSummary;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SlotsRepository {
  Optional<Slots> findById(UUID id);

  List<Slots> findAllByParkingLotsId(UUID parkingLotsId);

  List<SlotSummary> findAllSummaryByParkingLotsId(UUID parkingLotsId);

  Slots getReferenceById(UUID id);

  Boolean existsById(UUID id);

  Slots save(Slots slot);

  List<Slots> saveAllEntities(List<Slots> slots);

  void deleteById(UUID id);

  void batchDelete(List<UUID> ids);

  int softDeleteByParkingLotsId(UUID parkingLotsId);
}
