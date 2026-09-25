package dev.angelcorzo.nivo.domain.usecase.dashboard;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.DailySummaryModel;
import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.ParkingComparisonDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetParkingsComparisonUseCase {

  private final DailySummaryGateway dailyGateway;
  private final HourlyOccupancyGateway hourlyGateway;
  private final ParkingLotsRepository parkingLotsRepository;
  private final AuthenticationContextGateway authenticationContext;

  public List<ParkingComparisonDTO> execute(final LocalDate startDate, final LocalDate endDate) {
    final UUID tenantId = authenticationContext.getCurrentTenantId();
    return execute(tenantId, startDate, endDate);
  }

  public List<ParkingComparisonDTO> execute(
      final UUID tenantId, final LocalDate startDate, final LocalDate endDate) {
    final LocalDate today = LocalDate.now();
    final List<ParkingLotListItem> parkings = parkingLotsRepository.findByTenantId(tenantId);

    return parkings.stream()
        .map(parking -> buildParkingComparison(parking, today))
        .sorted(Comparator.comparingDouble(ParkingComparisonDTO::getOccupancyRate).reversed())
        .toList();
  }

  private ParkingComparisonDTO buildParkingComparison(final ParkingLotListItem p, final LocalDate today) {
    final UUID parkingId = p.id();
    final Optional<DailySummaryModel> summaryOpt = dailyGateway.findByParkingLotIdAndSummaryDate(parkingId, today);
    final Optional<HourlyOccupancyModel> latestOpt = hourlyGateway.findLatestByParkingLotId(parkingId);

    int totalCapacity = 0;
    double occupancyRate = 0.0;
    if (latestOpt.isPresent()) {
      final HourlyOccupancyModel latest = latestOpt.get();
      if (latest.getTotalCapacity() != null && latest.getTotalCapacity() > 0) {
        totalCapacity = latest.getTotalCapacity().intValue();
      }
      occupancyRate = latest.getEstimatedOccupancyRate() != null ? latest.getEstimatedOccupancyRate() : 0.0;
    } else if (p.totalCapacity() != null && p.totalCapacity() > 0) {
      totalCapacity = p.totalCapacity().intValue();
    }

    final int occupied = (int) Math.round(totalCapacity * (occupancyRate / 100.0));
    final BigDecimal revenue = summaryOpt
        .map(DailySummaryModel::getTotalRevenue)
        .filter(r -> r != null)
        .orElse(BigDecimal.ZERO);
    final long activeTickets = summaryOpt
        .map(DailySummaryModel::getOngoingTickets)
        .filter(t -> t != null)
        .orElse(0L);
    final double avgStay = summaryOpt
        .map(DailySummaryModel::getAvgDurationMinutes)
        .filter(d -> d != null)
        .orElse(0.0);

    return ParkingComparisonDTO.builder()
        .parkingId(parkingId)
        .parkingName(p.name())
        .totalSlots(totalCapacity)
        .occupiedSlots(occupied)
        .occupancyRate(occupancyRate)
        .todayRevenue(revenue)
        .currency(p.currency() != null ? p.currency() : "COP")
        .activeTickets(activeTickets)
        .avgStayMinutes(avgStay)
        .build();
  }
}
