package dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.mappers.ParkingLotSummaryDataMapper;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.mappers.ParkingLotsMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

/**
 * Pure JPA repository adapter for {@link ParkingLots}.
 *
 * <p>
 * Contains solely persistence logic against PostgreSQL via Spring Data JPA. Caching and cross-cutting concerns are
 * handled by caching decorators in the cache adapter layer.
 */
@Repository("parkingLotsRepositoryAdapter")
public class ParkingLotsRepositoryAdapter
  extends
    AdapterOperations<ParkingLots, ParkingLotsData, UUID, ParkingLotsRepositoryData>
  implements
    ParkingLotsRepository {

  private final ParkingLotSummaryDataMapper parkingLotSummaryDataMapper;
  private final ParkingLotsMapper parkingLotsMapper;

  public ParkingLotsRepositoryAdapter(
    final ParkingLotsRepositoryData repository,
    final ParkingLotSummaryDataMapper parkingLotSummaryDataMapper,
    final ParkingLotsMapper mapper) {
    super(repository, mapper);
    this.parkingLotSummaryDataMapper = parkingLotSummaryDataMapper;
    this.parkingLotsMapper = mapper;
  }

  @Override
  public List<ParkingLotListItem> findByTenantId(final UUID tenantId) {
    return super.repository.findAllByTenantId(tenantId)
      .stream()
      .map(this.parkingLotSummaryDataMapper::toSummaryData)
      .map(this.parkingLotsMapper::toListItem)
      .toList();
  }

  @Override
  public List<ParkingLots> findByOwnerId(final UUID ownerId) {
    return super.repository.findAllByOwnerId(ownerId)
      .stream()
      .map(super::toEntity)
      .toList();
  }

  @Override
  public ParkingLots getReferenceById(final UUID id) {
    return super.mapper.toEntity(super.repository.getReferenceById(id));
  }

  @Override
  public Boolean existsById(final UUID id) {
    return super.repository.existsById(id);
  }

  @Override
  public Optional<ParkingLots> findById(final UUID id) {
    return super.findById(id);
  }

  @Override
  public void delete(final ParkingLots parkingLots) {
    if (parkingLots == null) {
      return;
    }
    super.repository.delete(super.mapper.toData(parkingLots));
  }
}
