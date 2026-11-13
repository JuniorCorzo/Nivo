package dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot;

import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.model.slots.valueobject.SlotSummary;
import dev.angelcorzo.nivo.domain.model.utils.StringUtils;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.mappers.SlotSummaryDataMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot.mappers.SlotsMappers;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

/**
 * Pure JPA repository adapter for {@link Slots}.
 */
@Repository("slotsRepositoryAdapter")
public class SlotsRepositoryAdapter extends AdapterOperations<Slots, SlotsData, UUID, SlotsRepositoryData>
  implements
    SlotsRepository {

  private final SlotSummaryDataMapper slotSummaryDataMapper;

  public SlotsRepositoryAdapter(
    final SlotsRepositoryData repository,
    final SlotsMappers mapper,
    final SlotSummaryDataMapper slotSummaryDataMapper) {
    super(repository, mapper);
    this.slotSummaryDataMapper = slotSummaryDataMapper;
  }

  @Override
  public List<Slots> findAllById(final List<UUID> ids) {
    return super.repository.findAllById(ids).stream().map(super::toEntity).toList();
  }

  @Override
  public List<Slots> findAllByIdInAndTenantId(final List<UUID> ids, final UUID tenantId) {
    return super.repository.findAllByIdInAndTenant_Id(ids, tenantId).stream().map(super::toEntity).toList();
  }

  @Override
  public List<Slots> findAllByParkingLotsId(final UUID parkingLotsId) {
    return super.repository.findAllByParking_Id(parkingLotsId).stream().map(super::toEntity).toList();
  }

  @Override
  public List<Slots> findAllByParkingLotsIdAndZoneAndPrefix(final UUID parkingLotsId, final String zone,
    final String prefix) {
    return super.repository.findAllByParking_IdAndZoneAndPrefix(parkingLotsId, StringUtils.normalize(zone),
      StringUtils.normalize(prefix)).stream().map(super::toEntity).toList();
  }

  @Override
  public List<SlotSummary> findAllSummaryByParkingLotsId(final UUID parkingLotsId) {
    return super.repository.findAllSummaryByParking_Id(parkingLotsId)
      .stream()
      .map(this.slotSummaryDataMapper::toSummaryData)
      .map(this.slotSummaryDataMapper::toModel)
      .toList();
  }

  @Override
  public Slots getReferenceById(final UUID id) {
    return super.mapper.toEntity(super.repository.getReferenceById(id));
  }

  @Override
  public Boolean existsById(final UUID id) {
    return super.repository.existsById(id);
  }

  @Override
  public List<Slots> saveAll(final List<Slots> slots) {
    return super.saveAllEntities(slots);
  }

  @Override
  public List<Slots> saveAllEntities(final List<Slots> slots) {
    return super.saveAllEntities(slots);
  }

  @Override
  public void deleteById(final UUID id) {
    super.repository.deleteById(id);
  }

  @Override
  public int softDeleteByParkingLotsId(final UUID parkingLotsId) {
    return super.repository.softDeleteByParkingLotsId(parkingLotsId);
  }

  @Override
  public void batchDelete(final List<UUID> ids) {
    if (ids == null || ids.isEmpty()) {
      return;
    }
    super.repository.softDeleteByIds(ids);
  }

  @Override
  public void batchDelete(final List<UUID> ids, final UUID tenantId) {
    if (ids == null || ids.isEmpty()) {
      return;
    }
    if (tenantId != null) {
      super.repository.softDeleteByIdsAndTenantId(ids, tenantId);
    } else {
      this.batchDelete(ids);
    }
  }
}
