package dev.angelcorzo.nivo.domain.model.slots.gateways;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.valueobject.SlotSummary;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SlotsRepository {
  Optional<Slots> findById(UUID id);

  List<Slots> findAllById(List<UUID> ids);

  List<Slots> findAllByIdInAndTenantId(List<UUID> ids, UUID tenantId);

  List<Slots> findAllByParkingLotsId(UUID parkingLotsId);

  List<Slots> findAllByParkingLotsIdAndZoneAndPrefix(UUID parkingLotsId, String zone, String prefix);

  List<SlotSummary> findAllSummaryByParkingLotsId(UUID parkingLotsId);

  Slots getReferenceById(UUID id);

  Boolean existsById(UUID id);

  Slots save(Slots slot);

  List<Slots> saveAll(List<Slots> slots);

  List<Slots> saveAllEntities(List<Slots> slots);

  void deleteById(UUID id);

  void batchDelete(List<UUID> ids);

  int softDeleteByParkingLotsId(UUID parkingLotsId);
}
