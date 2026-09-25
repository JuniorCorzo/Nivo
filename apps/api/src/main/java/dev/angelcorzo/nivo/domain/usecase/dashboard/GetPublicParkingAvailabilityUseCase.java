package dev.angelcorzo.nivo.domain.usecase.dashboard;

import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.model.slots.gateways.SlotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.PublicParkingAvailabilityDTO;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.HourlyOccupancyViewRepository;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetPublicParkingAvailabilityUseCase {

  private final ParkingLotsRepository parkingLotsRepository;
  private final HourlyOccupancyViewRepository hourlyRepository;
  private final SlotsRepository slotsRepository;

  public Optional<PublicParkingAvailabilityDTO> execute(UUID parkingId) {
    var parkingOpt = parkingLotsRepository.findById(parkingId);
    if (parkingOpt.isEmpty()) {
      return Optional.empty();
    }

    var parking = parkingOpt.get();
    var hourlyList = hourlyRepository.findByParkingLotId(parkingId);

    long totalSlots = 0;
    double occupancyRate = 0.0;
    if (!hourlyList.isEmpty()) {
      var latest = hourlyList.getLast();
      totalSlots = latest.getTotalCapacity() != null ? latest.getTotalCapacity() : 0;
      occupancyRate =
          latest.getEstimatedOccupancyRate() != null ? latest.getEstimatedOccupancyRate() : 0.0;
    } else {
      var slots = slotsRepository.findAllByParkingLotsId(parkingId);
      totalSlots = slots.size();
    }

    long occupiedSlots = Math.round(totalSlots * (occupancyRate / 100.0));
    long availableSlots = Math.max(0, totalSlots - occupiedSlots);

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
