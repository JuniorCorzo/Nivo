package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.HourlyOccupancyId;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.HourlyOccupancyViewEntity;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HourlyOccupancyViewRepository extends JpaRepository<HourlyOccupancyViewEntity, HourlyOccupancyId> {
  List<HourlyOccupancyViewEntity> findByParkingLotId(UUID parkingLotId);
  List<HourlyOccupancyViewEntity> findByTenantIdAndParkingLotId(UUID tenantId, UUID parkingLotId);
  List<HourlyOccupancyViewEntity> findByTenantId(UUID tenantId);
  List<HourlyOccupancyViewEntity> findByTenantIdAndParkingLotIdAndHourBucketBetween(UUID tenantId, UUID parkingLotId, OffsetDateTime start, OffsetDateTime end);
  List<HourlyOccupancyViewEntity> findByTenantIdAndHourBucketBetween(UUID tenantId, OffsetDateTime start, OffsetDateTime end);
}
