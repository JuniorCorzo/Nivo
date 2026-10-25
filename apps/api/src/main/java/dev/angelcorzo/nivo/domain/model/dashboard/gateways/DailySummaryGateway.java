package dev.angelcorzo.nivo.domain.model.dashboard.gateways;

import dev.angelcorzo.nivo.domain.model.dashboard.DailySummaryModel;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DailySummaryGateway {
  <T> Optional<T> findDashboardSummary(UUID tenantId, UUID parkingId, LocalDate targetDate,
    int comparisonDays);

  Optional<DailySummaryModel> findByParkingLotIdAndSummaryDate(UUID parkingLotId, LocalDate summaryDate);

  List<DailySummaryModel> findByParkingLotIdAndSummaryDates(UUID parkingLotId, List<LocalDate> summaryDates);

  List<DailySummaryModel> findAllByTenantIdAndSummaryDate(UUID tenantId, LocalDate summaryDate);

  List<DailySummaryModel> findAllByTenantIdAndSummaryDates(UUID tenantId, List<LocalDate> summaryDates);

  List<DailySummaryModel> findAllByTenantId(UUID tenantId);

  List<DailySummaryModel> findAllByTenantIdAndParkingLotId(UUID tenantId, UUID parkingLotId);
}
