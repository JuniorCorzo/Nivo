package dev.angelcorzo.nivo.domain.usecase.dashboard;

import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.HourlyOccupancyDTO;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.HourlyOccupancyViewEntity;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.HourlyOccupancyViewRepository;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetHourlyOccupancyUseCase {

  private final HourlyOccupancyViewRepository hourlyRepository;

  public List<HourlyOccupancyDTO> execute(UUID tenantId, UUID parkingId, OffsetDateTime start, OffsetDateTime end) {
    if (parkingId != null) {
      List<HourlyOccupancyViewEntity> entities;
      if (start != null && end != null) {
        entities = hourlyRepository.findByTenantIdAndParkingLotIdAndHourBucketBetween(tenantId, parkingId, start, end);
      } else {
        entities = hourlyRepository.findByTenantIdAndParkingLotId(tenantId, parkingId);
      }
      return entities.stream().map(e -> HourlyOccupancyDTO.builder()
          .parkingId(e.getParkingLotId())
          .hourBucket(e.getHourBucket())
          .checkins(e.getCheckins())
          .checkouts(e.getCheckouts())
          .totalCapacity(e.getTotalCapacity())
          .occupancyRate(e.getEstimatedOccupancyRate())
          .build()).toList();
    }

    List<HourlyOccupancyViewEntity> entities;
    if (start != null && end != null) {
      entities = hourlyRepository.findByTenantIdAndHourBucketBetween(tenantId, start, end);
    } else {
      entities = hourlyRepository.findByTenantId(tenantId);
    }

    Map<OffsetDateTime, List<HourlyOccupancyViewEntity>> byHour = entities.stream()
        .collect(Collectors.groupingBy(HourlyOccupancyViewEntity::getHourBucket));

    List<HourlyOccupancyDTO> result = new ArrayList<>();
    for (Map.Entry<OffsetDateTime, List<HourlyOccupancyViewEntity>> entry : byHour.entrySet()) {
      long checkins = entry.getValue().stream().mapToLong(e -> e.getCheckins() != null ? e.getCheckins() : 0).sum();
      long checkouts = entry.getValue().stream().mapToLong(e -> e.getCheckouts() != null ? e.getCheckouts() : 0).sum();
      long capacity = entry.getValue().stream().mapToLong(e -> e.getTotalCapacity() != null ? e.getTotalCapacity() : 0).sum();
      double rate = capacity > 0 ? Math.min(100.0, Math.round((checkins * 100.0 / capacity) * 100.0) / 100.0) : 0.0;

      result.add(HourlyOccupancyDTO.builder()
          .parkingId(null)
          .hourBucket(entry.getKey())
          .checkins(checkins)
          .checkouts(checkouts)
          .totalCapacity(capacity)
          .occupancyRate(rate)
          .build());
    }

    result.sort((a, b) -> a.getHourBucket().compareTo(b.getHourBucket()));
    return result;
  }
}
