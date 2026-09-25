package dev.angelcorzo.nivo.domain.usecase.dashboard;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.HourlyOccupancyDTO;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetHourlyOccupancyUseCase {

  private final HourlyOccupancyGateway hourlyGateway;
  private final AuthenticationContextGateway authenticationContext;

  public List<HourlyOccupancyDTO> execute(
      final UUID parkingId, final OffsetDateTime start, final OffsetDateTime end) {
    final UUID tenantId = authenticationContext.getCurrentTenantId();
    return execute(tenantId, parkingId, start, end);
  }

  public List<HourlyOccupancyDTO> execute(
      final UUID tenantId, final UUID parkingId, final OffsetDateTime start, final OffsetDateTime end) {
    if (parkingId != null) {
      return getParkingHourlyOccupancy(tenantId, parkingId, start, end);
    }
    return getTenantHourlyOccupancy(tenantId, start, end);
  }

  private List<HourlyOccupancyDTO> getParkingHourlyOccupancy(
      final UUID tenantId, final UUID parkingId, final OffsetDateTime start, final OffsetDateTime end) {
    final List<HourlyOccupancyModel> entities = fetchParkingEntities(tenantId, parkingId, start, end);
    return entities.stream().map(this::toParkingHourlyDTO).toList();
  }

  private List<HourlyOccupancyModel> fetchParkingEntities(
      final UUID tenantId, final UUID parkingId, final OffsetDateTime start, final OffsetDateTime end) {
    if (start != null && end != null) {
      return hourlyGateway.findByTenantIdAndParkingLotIdAndHourBucketBetween(tenantId, parkingId, start, end);
    }
    return hourlyGateway.findByTenantIdAndParkingLotId(tenantId, parkingId);
  }

  private HourlyOccupancyDTO toParkingHourlyDTO(final HourlyOccupancyModel e) {
    return HourlyOccupancyDTO.builder()
        .parkingId(e.getParkingLotId())
        .hourBucket(e.getHourBucket())
        .checkins(e.getCheckins())
        .checkouts(e.getCheckouts())
        .totalCapacity(e.getTotalCapacity())
        .occupancyRate(e.getEstimatedOccupancyRate())
        .build();
  }

  private List<HourlyOccupancyDTO> getTenantHourlyOccupancy(
      final UUID tenantId, final OffsetDateTime start, final OffsetDateTime end) {
    final List<HourlyOccupancyModel> entities = fetchTenantEntities(tenantId, start, end);
    final Map<OffsetDateTime, List<HourlyOccupancyModel>> byHour = entities.stream()
        .collect(Collectors.groupingBy(HourlyOccupancyModel::getHourBucket));

    return byHour.entrySet().stream()
        .sorted(Map.Entry.comparingByKey())
        .map(entry -> toTenantAggregatedDTO(entry.getKey(), entry.getValue()))
        .toList();
  }

  private List<HourlyOccupancyModel> fetchTenantEntities(
      final UUID tenantId, final OffsetDateTime start, final OffsetDateTime end) {
    if (start != null && end != null) {
      return hourlyGateway.findByTenantIdAndHourBucketBetween(tenantId, start, end);
    }
    return hourlyGateway.findByTenantId(tenantId);
  }

  private HourlyOccupancyDTO toTenantAggregatedDTO(
      final OffsetDateTime hourBucket, final List<HourlyOccupancyModel> models) {
    final long checkins = models.stream()
        .mapToLong(e -> e.getCheckins() != null ? e.getCheckins() : 0L)
        .sum();
    final long checkouts = models.stream()
        .mapToLong(e -> e.getCheckouts() != null ? e.getCheckouts() : 0L)
        .sum();
    final long capacity = models.stream()
        .mapToLong(e -> e.getTotalCapacity() != null ? e.getTotalCapacity() : 0L)
        .sum();
    final double rate = capacity > 0
        ? Math.min(100.0, Math.round((checkins * 100.0 / capacity) * 100.0) / 100.0)
        : 0.0;

    return HourlyOccupancyDTO.builder()
        .parkingId(null)
        .hourBucket(hourBucket)
        .checkins(checkins)
        .checkouts(checkouts)
        .totalCapacity(capacity)
        .occupancyRate(rate)
        .build();
  }
}
