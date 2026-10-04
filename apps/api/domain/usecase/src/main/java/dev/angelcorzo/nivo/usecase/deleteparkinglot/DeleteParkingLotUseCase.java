package dev.angelcorzo.nivo.usecase.deleteparkinglot;

import dev.angelcorzo.nivo.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.model.slots.gateways.SlotsRepository;
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
