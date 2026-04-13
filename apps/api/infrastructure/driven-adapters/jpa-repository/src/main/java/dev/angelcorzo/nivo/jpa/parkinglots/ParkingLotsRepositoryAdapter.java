package dev.angelcorzo.nivo.jpa.parkinglots;

import dev.angelcorzo.nivo.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.jpa.parkinglots.mappers.ParkingLotsMapper;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class ParkingLotsRepositoryAdapter
    extends AdapterOperations<ParkingLots, ParkingLotsData, UUID, ParkingLotsRepositoryData>
    implements ParkingLotsRepository {

  /**
   * Constructor for AdapterOperations.
   *
   * @param repository The JPA repository instance.
   * @param mapper The mapper for converting between domain and data entities.
   */
  protected ParkingLotsRepositoryAdapter(
      ParkingLotsRepositoryData repository, ParkingLotsMapper mapper) {
    super(repository, mapper);
  }

  @Override
  public List<ParkingLots> findByTenantId(UUID tenantId) {
    return super.repository.findAllByTenantId(tenantId).stream().map(super::toEntity).toList();
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
