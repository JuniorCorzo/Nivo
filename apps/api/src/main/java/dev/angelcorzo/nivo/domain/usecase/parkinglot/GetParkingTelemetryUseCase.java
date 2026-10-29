package dev.angelcorzo.nivo.domain.usecase.parkinglot;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingTelemetry;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingTelemetryGateway;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetParkingTelemetryUseCase {
  private final ParkingTelemetryGateway parkingTelemetryGateway;

  public ParkingTelemetry execute(UUID parkingId) {
    return this.parkingTelemetryGateway.getTelemetry(parkingId);
  }
}
