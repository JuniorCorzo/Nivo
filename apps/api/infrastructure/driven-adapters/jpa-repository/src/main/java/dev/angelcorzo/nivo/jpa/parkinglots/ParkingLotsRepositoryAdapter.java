package dev.angelcorzo.nivo.jpa.parkinglots;

import dev.angelcorzo.nivo.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.jpa.parkinglots.mappers.ParkingLotSummaryDataMapper;
import dev.angelcorzo.nivo.jpa.parkinglots.mappers.ParkingLotsMapper;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class ParkingLotsRepositoryAdapter
    extends AdapterOperations<ParkingLots, ParkingLotsData, UUID, ParkingLotsRepositoryData>
    implements ParkingLotsRepository {

  private final ParkingLotSummaryDataMapper parkingLotSummaryDataMapper;
  private final ParkingLotsMapper parkingLotsMapper;

  protected ParkingLotsRepositoryAdapter(
      ParkingLotsRepositoryData repository,
      ParkingLotSummaryDataMapper parkingLotSummaryDataMapper,
      ParkingLotsMapper mapper) {
    super(repository, mapper);
    this.parkingLotSummaryDataMapper = parkingLotSummaryDataMapper;
    this.parkingLotsMapper = mapper;
  }

  @Override
  public List<ParkingLotListItem> findByTenantId(UUID tenantId) {
    return super.repository.findAllByTenantId(tenantId).stream()
        .map(parkingLotSummaryDataMapper::toSummaryData)
        .map(parkingLotsMapper::toListItem)
        .toList();
  }

  @Override
  public List<ParkingLots> findByOwnerId(UUID ownerId) {
    return super.repository.findAllByOwnerId(ownerId).stream().map(super::toEntity).toList();
  }

  @Override
  public ParkingLots getReferenceById(UUID id) {
    return super.mapper.toEntity(super.repository.getReferenceById(id));
  }

  @Override
  public Boolean existsById(UUID id) {
    return super.repository.existsById(id);
  }

  @Override
  public void delete(ParkingLots parkingLots) {
    super.repository.delete(super.mapper.toData(parkingLots));
  }
}
