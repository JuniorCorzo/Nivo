package dev.angelcorzo.nivo.domain.model.parkinglots.gateways;

import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingTelemetry;
import java.util.UUID;

public interface ParkingTelemetryGateway {
  ParkingTelemetry getTelemetry(UUID parkingId);
}
