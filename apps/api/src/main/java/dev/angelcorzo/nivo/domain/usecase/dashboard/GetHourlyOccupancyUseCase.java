package dev.angelcorzo.nivo.domain.usecase.dashboard;

import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.HourlyOccupancyDTO;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetHourlyOccupancyUseCase {

  private final HourlyOccupancyGateway hourlyGateway;

  public List<HourlyOccupancyDTO> execute(UUID tenantId, UUID parkingId, OffsetDateTime start, OffsetDateTime end) {
    if (parkingId != null) {
      List<HourlyOccupancyModel> entities;
      if (start != null && end != null) {
        entities = hourlyGateway.findByTenantIdAndParkingLotIdAndHourBucketBetween(tenantId, parkingId, start, end);
      } else {
        entities = hourlyGateway.findByTenantIdAndParkingLotId(tenantId, parkingId);
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

    List<HourlyOccupancyModel> entities;
    if (start != null && end != null) {
      entities = hourlyGateway.findByTenantIdAndHourBucketBetween(tenantId, start, end);
    } else {
      entities = hourlyGateway.findByTenantId(tenantId);
    }

    Map<OffsetDateTime, List<HourlyOccupancyModel>> byHour = entities.stream()
        .collect(Collectors.groupingBy(HourlyOccupancyModel::getHourBucket));

    List<HourlyOccupancyDTO> result = new ArrayList<>();
    for (Map.Entry<OffsetDateTime, List<HourlyOccupancyModel>> entry : byHour.entrySet()) {
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
