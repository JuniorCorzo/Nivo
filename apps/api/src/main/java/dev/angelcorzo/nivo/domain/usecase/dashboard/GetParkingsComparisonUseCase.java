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

    final int totalCapacity;
    if (p.totalCapacity() != null && p.totalCapacity() > 0) {
      totalCapacity = p.totalCapacity().intValue();
    } else if (latestOpt.isPresent() && latestOpt.get().getTotalCapacity() != null && latestOpt.get().getTotalCapacity() > 0) {
      totalCapacity = latestOpt.get().getTotalCapacity().intValue();
    } else {
      totalCapacity = 0;
    }

    final double occupancyRate;
    if (p.occuppationRate() != null) {
      occupancyRate = p.occuppationRate();
    } else if (latestOpt.isPresent() && latestOpt.get().getEstimatedOccupancyRate() != null && latestOpt.get().getEstimatedOccupancyRate() > 0) {
      occupancyRate = latestOpt.get().getEstimatedOccupancyRate();
    } else if (summaryOpt.isPresent() && summaryOpt.get().getOngoingTickets() != null && summaryOpt.get().getOngoingTickets() > 0 && totalCapacity > 0) {
      occupancyRate = Math.round((summaryOpt.get().getOngoingTickets() * 100.0 / totalCapacity) * 100.0) / 100.0;
    } else if (latestOpt.isPresent() && latestOpt.get().getEstimatedOccupancyRate() != null) {
      occupancyRate = latestOpt.get().getEstimatedOccupancyRate();
    } else {
      occupancyRate = 0.0;
    }

    final int rawOccupied = (int) Math.round(totalCapacity * (occupancyRate / 100.0));
    final int occupied = (rawOccupied == 0 && summaryOpt.isPresent() && summaryOpt.get().getOngoingTickets() != null && summaryOpt.get().getOngoingTickets() > 0)
        ? summaryOpt.get().getOngoingTickets().intValue()
        : rawOccupied;
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
