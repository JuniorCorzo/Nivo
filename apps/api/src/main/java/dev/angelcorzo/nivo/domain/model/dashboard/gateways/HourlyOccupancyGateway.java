package dev.angelcorzo.nivo.domain.model.dashboard.gateways;

import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface HourlyOccupancyGateway {
  List<HourlyOccupancyModel> findByParkingLotId(UUID parkingLotId);
  List<HourlyOccupancyModel> findByTenantId(UUID tenantId);
  List<HourlyOccupancyModel> findByTenantIdAndParkingLotId(UUID tenantId, UUID parkingLotId);
  List<HourlyOccupancyModel> findByTenantIdAndParkingLotIdAndHourBucketBetween(
      UUID tenantId, UUID parkingLotId, OffsetDateTime start, OffsetDateTime end);
  List<HourlyOccupancyModel> findByTenantIdAndHourBucketBetween(
      UUID tenantId, OffsetDateTime start, OffsetDateTime end);
}
