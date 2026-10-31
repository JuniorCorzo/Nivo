package dev.angelcorzo.nivo.domain.usecase.parkinglot;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingTelemetry;
import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingTelemetryGateway;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetParkingTelemetryUseCase {
  private final ParkingLotsRepository parkingLotsRepository;
  private final AuthenticationContextGateway authenticationContext;
  private final ParkingTelemetryGateway parkingTelemetryGateway;

  public ParkingTelemetry execute(final UUID parkingId) {
    final UUID tenantId = this.authenticationContext.getCurrentTenantId();
    final ParkingLots parkingLot = this.parkingLotsRepository.findById(parkingId)
      .orElseThrow(() -> new ParkingNotExistsException(parkingId));

    if (parkingLot.getTenant() == null || !tenantId.equals(parkingLot.getTenant().id())) {
      throw new ParkingNotExistsException(parkingId);
    }

    return this.parkingTelemetryGateway.getTelemetry(parkingId);
  }
}
