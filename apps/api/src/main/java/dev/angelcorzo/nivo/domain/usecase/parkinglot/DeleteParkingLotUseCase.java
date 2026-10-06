package dev.angelcorzo.nivo.domain.usecase.parkinglot;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class DeleteParkingLotUseCase {

  private final ParkingLotsRepository parkingLotsRepository;
  private final SlotsRepository slotsRepository;
  private final AuthenticationContextGateway authenticationContext;

  public void execute(UUID parkingId) {
    this.execute(parkingId, this.authenticationContext.getCurrentTenantId());
  }

  public void execute(UUID parkingId, UUID tenantId) {
    ParkingLots parkingLot =
        parkingLotsRepository
            .findById(parkingId)
            .orElseThrow(() -> new ParkingNotExistsException(parkingId));

    if (parkingLot.getTenant() == null || !tenantId.equals(parkingLot.getTenant().id())) {
      throw new ParkingNotExistsException(parkingId);
    }

    slotsRepository.softDeleteByParkingLotsId(parkingId);

    parkingLotsRepository.delete(parkingLot);
  }
}
