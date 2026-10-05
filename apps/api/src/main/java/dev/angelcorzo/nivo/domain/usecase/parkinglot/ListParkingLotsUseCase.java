package dev.angelcorzo.nivo.domain.usecase.parkinglot;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
public class ListParkingLotsUseCase {
  private final ParkingLotsRepository parkingLotsRepository;

  public List<ParkingLotListItem> listParkingLots(UUID tenantId) {
    return this.parkingLotsRepository.findByTenantId(tenantId);
  }
}
