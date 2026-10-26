package dev.angelcorzo.nivo.domain.usecase.dashboard.strategy;

import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.DashboardSummaryQuery;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GlobalTenantDashboardSummaryStrategy implements DashboardSummaryStrategy {

  private final DailySummaryGateway dailyGateway;
  private final HourlyOccupancyGateway hourlyGateway;
  private final ParkingLotsRepository parkingLotsRepository;

  @Override
  public boolean supports(final DashboardSummaryQuery query) {
    return query != null && query.parkingId() == null;
  }

  @Override
  public DashboardSummaryDTO execute(final DashboardSummaryQuery query) {
    final UUID tenantId = query.tenantId();
    final LocalDate targetDate = query.targetDate();

    final Optional<DashboardSummaryDTO> summaryOpt = dailyGateway.findDashboardSummary(
      tenantId, null, targetDate, 7);
    return summaryOpt.orElseGet(() -> buildZeroGlobalSummary(targetDate));
  }

  private DashboardSummaryDTO buildZeroGlobalSummary(final LocalDate targetDate) {
    return DashboardSummaryDTO.builder()
      .scope("GLOBAL")
      .parkingId(null)
      .totalCapacity(0)
      .occupiedSlots(0)
      .availableSlots(0)
      .occupancyRate(0.0)
      .todayRevenue(BigDecimal.ZERO)
      .currency("COP")
      .avgStayMinutes(0.0)
      .totalTickets(0L)
      .activeTickets(0L)
      .completedTickets(0L)
      .revenueDeltaPercentage(null)
      .avgStayDeltaMinutes(null)
      .digitalPaymentRatio(0.0)
      .gracePeriodMinutes(null)
      .build();
  }
}
