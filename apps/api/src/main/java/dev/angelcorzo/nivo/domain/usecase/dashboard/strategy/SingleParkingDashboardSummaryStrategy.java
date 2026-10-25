package dev.angelcorzo.nivo.domain.usecase.dashboard.strategy;

import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.DashboardSummaryQuery;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class SingleParkingDashboardSummaryStrategy implements DashboardSummaryStrategy {

  private final DailySummaryGateway dailyGateway;
  private final HourlyOccupancyGateway hourlyGateway;
  private final ParkingLotsRepository parkingLotsRepository;

  @Override
  public boolean supports(final DashboardSummaryQuery query) {
    return query != null && query.parkingId() != null;
  }

  @Override
  public DashboardSummaryDTO execute(final DashboardSummaryQuery query) {
    final UUID tenantId = query.tenantId();
    final UUID parkingId = query.parkingId();
    final LocalDate targetDate = query.targetDate();

    final ParkingLots parkingLot = parkingLotsRepository.findById(parkingId)
      .orElseThrow(() -> new ParkingNotExistsException(parkingId));
    if (!parkingLot.getTenant().id().equals(tenantId)) {
      throw new ParkingNotExistsException(parkingId);
    }

    final Optional<DashboardSummaryDTO> summaryOpt = dailyGateway.findDashboardSummary(
      tenantId, parkingId, targetDate, 7);
    return summaryOpt.orElseGet(() -> buildZeroSummary(parkingLot, targetDate));
  }

  private DashboardSummaryDTO buildZeroSummary(final ParkingLots parkingLot,
    final LocalDate targetDate) {
    final int gracePeriod = parkingLot.getPolicy() != null
      ? parkingLot.getPolicy().gracePeriodMinutes()
      : 0;
    final String currency = parkingLot.getCurrency() != null
      && !parkingLot.getCurrency().isBlank()
        ? parkingLot.getCurrency()
        : "COP";

    return DashboardSummaryDTO.builder()
      .scope("SINGLE")
      .parkingId(parkingLot.getId())
      .totalCapacity(0)
      .occupiedSlots(0)
      .availableSlots(0)
      .occupancyRate(0.0)
      .todayRevenue(BigDecimal.ZERO)
      .currency(currency)
      .avgStayMinutes(0.0)
      .totalTickets(0L)
      .activeTickets(0L)
      .completedTickets(0L)
      .revenueDeltaPercentage(null)
      .avgStayDeltaMinutes(null)
      .digitalPaymentRatio(0.0)
      .gracePeriodMinutes(gracePeriod)
      .build();
  }
}
