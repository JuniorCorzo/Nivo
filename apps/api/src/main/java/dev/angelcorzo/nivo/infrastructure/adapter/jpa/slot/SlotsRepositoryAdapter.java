package dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.mappers.SlotSummaryDataMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.mappers.SlotsMappers;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.slots.valueobject.SlotSummary;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class SlotsRepositoryAdapter
    extends AdapterOperations<Slots, SlotsData, UUID, SlotsRepositoryData>
    implements SlotsRepository {

  private final SlotSummaryDataMapper slotSummaryDataMapper;

  /**
   * Constructor for AdapterOperations.
   *
   * @param repository The JPA repository instance.
   * @param mapper     The mapper for converting between domain and data entities.
   */
  protected SlotsRepositoryAdapter(
      SlotsRepositoryData repository, SlotsMappers mapper, SlotSummaryDataMapper slotSummaryDataMapper) {
    super(repository, mapper);
    this.slotSummaryDataMapper = slotSummaryDataMapper;
  }

  @Override
  public List<Slots> findAllById(List<UUID> ids) {
    return super.repository.findAllById(ids).stream()
        .map(super::toEntity)
        .toList();
  }

  @Override
  public List<Slots> findAllByIdInAndTenantId(List<UUID> ids, UUID tenantId) {
    return super.repository.findAllByIdInAndTenant_Id(ids, tenantId).stream()
        .map(super::toEntity)
        .toList();
  }

  @Override
  public List<Slots> findAllByParkingLotsId(UUID parkingLotsId) {
    return super.repository.findAllByParking_Id(parkingLotsId).stream()
        .map(super::toEntity)
        .toList();
  }

  @Override
  public List<Slots> findAllByParkingLotsIdAndZoneAndPrefix(UUID parkingLotsId, String zone, String prefix) {
    return super.repository.findAllByParking_IdAndZoneAndPrefix(parkingLotsId, zone, prefix).stream()
        .map(super::toEntity)
        .toList();
  }

  @Override
  public List<SlotSummary> findAllSummaryByParkingLotsId(UUID parkingLotsId) {
    return super.repository.findAllSummaryByParking_Id(parkingLotsId).stream()
        .map(this.slotSummaryDataMapper::toSummaryData)
        .map(this.slotSummaryDataMapper::toModel)
        .toList();
  }

  @Override
  public Slots getReferenceById(UUID id) {
    return super.mapper.toEntity(super.repository.getReferenceById(id));
  }

  @Override
  public Boolean existsById(UUID id) {
    return super.repository.existsById(id);
  }

  @Override
  public List<Slots> saveAll(List<Slots> slots) {
    return super.saveAllEntities(slots);
  }

  @Override
  public List<Slots> saveAllEntities(List<Slots> slots) {
    return super.saveAllEntities(slots);
  }

  @Override
  public void deleteById(UUID id) {
    super.repository.deleteById(id);
  }

  @Override
  public int softDeleteByParkingLotsId(UUID parkingLotsId) {
    return super.repository.softDeleteByParkingLotsId(parkingLotsId);
  }

  @Override
  public void batchDelete(List<UUID> ids) {
    super.repository.deleteAllByIdInBatch(ids);
  }
}
