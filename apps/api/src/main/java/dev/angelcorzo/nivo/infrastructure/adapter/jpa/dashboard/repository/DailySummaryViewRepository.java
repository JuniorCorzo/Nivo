package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.DailySummaryId;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.DailySummaryViewEntity;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DailySummaryViewRepository extends JpaRepository<DailySummaryViewEntity, DailySummaryId> {
  Optional<DailySummaryViewEntity> findByParkingLotIdAndSummaryDate(UUID parkingLotId, LocalDate summaryDate);
  List<DailySummaryViewEntity> findAllByTenantId(UUID tenantId);
  List<DailySummaryViewEntity> findAllByTenantIdAndSummaryDate(UUID tenantId, LocalDate summaryDate);
  List<DailySummaryViewEntity> findAllByTenantIdAndParkingLotId(UUID tenantId, UUID parkingLotId);
  List<DailySummaryViewEntity> findAllByTenantIdAndSummaryDateBetween(UUID tenantId, LocalDate start, LocalDate end);
  List<DailySummaryViewEntity> findAllByTenantIdAndParkingLotIdAndSummaryDateBetween(UUID tenantId, UUID parkingLotId, LocalDate start, LocalDate end);
}
