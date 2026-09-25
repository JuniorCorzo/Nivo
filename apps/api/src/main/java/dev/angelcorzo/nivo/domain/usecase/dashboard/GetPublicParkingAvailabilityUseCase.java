package dev.angelcorzo.nivo.domain.usecase.dashboard;

import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.slots.Slots;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.PublicParkingAvailabilityDTO;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetPublicParkingAvailabilityUseCase {

  private final ParkingLotsRepository parkingLotsRepository;
  private final HourlyOccupancyGateway hourlyGateway;
  private final SlotsRepository slotsRepository;

  public Optional<PublicParkingAvailabilityDTO> execute(final UUID parkingId) {
    final Optional<ParkingLots> parkingOpt = parkingLotsRepository.findById(parkingId);
    if (parkingOpt.isEmpty()) {
      return Optional.empty();
    }

    final ParkingLots parking = parkingOpt.get();
    final Optional<HourlyOccupancyModel> latestOpt = hourlyGateway.findLatestByParkingLotId(parkingId);

    final long totalSlots;
    final double occupancyRate;
    if (latestOpt.isPresent()) {
      final HourlyOccupancyModel latest = latestOpt.get();
      totalSlots = latest.getTotalCapacity() != null ? latest.getTotalCapacity() : 0L;
      occupancyRate =
          latest.getEstimatedOccupancyRate() != null ? latest.getEstimatedOccupancyRate() : 0.0;
    } else {
      final List<Slots> slots = slotsRepository.findAllByParkingLotsId(parkingId);
      totalSlots = slots.size();
      occupancyRate = 0.0;
    }

    final long occupiedSlots = Math.round(totalSlots * (occupancyRate / 100.0));
    final long availableSlots = Math.max(0L, totalSlots - occupiedSlots);

    return Optional.of(
        PublicParkingAvailabilityDTO.builder()
            .parkingId(parkingId)
            .parkingName(parking.getName() != null ? parking.getName() : "Parqueadero")
            .totalSlots(totalSlots)
            .availableSlots(availableSlots)
            .occupiedSlots(occupiedSlots)
            .timestamp(OffsetDateTime.now())
            .build());
  }
}
