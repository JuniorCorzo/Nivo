package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.DailySummaryId;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.DailySummaryViewEntity;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.projection.DashboardSummaryProjection;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DailySummaryViewRepository extends JpaRepository<DailySummaryViewEntity, DailySummaryId> {
  @Query(value = """
        SELECT * FROM nivo.fn_get_dashboard_summary(:tenantId, :parkingId, :targetDate, :comparisonDays)
    """, nativeQuery = true)
  Optional<DashboardSummaryProjection> findDashboardSummary(
    @Param("tenantId") UUID tenantId,
    @Param("parkingId") UUID parkingId,
    @Param("targetDate") LocalDate targetDate,
    @Param("comparisonDays") int comparisonDays);

  Optional<DailySummaryViewEntity> findByParkingLotIdAndSummaryDate(UUID parkingLotId, LocalDate summaryDate);

  List<DailySummaryViewEntity> findByParkingLotIdAndSummaryDateIn(UUID parkingLotId,
    List<LocalDate> summaryDates);

  List<DailySummaryViewEntity> findAllByTenantId(UUID tenantId);

  List<DailySummaryViewEntity> findAllByTenantIdAndSummaryDate(UUID tenantId, LocalDate summaryDate);

  List<DailySummaryViewEntity> findAllByTenantIdAndSummaryDateIn(UUID tenantId, List<LocalDate> summaryDates);

  List<DailySummaryViewEntity> findAllByTenantIdAndParkingLotId(UUID tenantId, UUID parkingLotId);

  List<DailySummaryViewEntity> findAllByTenantIdAndSummaryDateBetween(UUID tenantId, LocalDate start, LocalDate end);

  List<DailySummaryViewEntity> findAllByTenantIdAndParkingLotIdAndSummaryDateBetween(UUID tenantId, UUID parkingLotId,
    LocalDate start, LocalDate end);
}
