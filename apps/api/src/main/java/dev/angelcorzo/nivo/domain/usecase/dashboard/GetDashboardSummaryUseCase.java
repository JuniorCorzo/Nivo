package dev.angelcorzo.nivo.domain.usecase.dashboard;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.DailySummaryModel;
import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetDashboardSummaryUseCase {

  private final DailySummaryGateway dailyGateway;
  private final HourlyOccupancyGateway hourlyGateway;
  private final ParkingLotsRepository parkingLotsRepository;
  private final AuthenticationContextGateway authenticationContext;

  public DashboardSummaryDTO execute(final UUID parkingId) {
    final UUID tenantId = authenticationContext.getCurrentTenantId();
    return execute(tenantId, parkingId);
  }

  public DashboardSummaryDTO execute(final UUID tenantId, final UUID parkingId) {
    if (parkingId != null) {
      return executeSingleParking(tenantId, parkingId);
    }
    return executeGlobalTenant(tenantId);
  }

  private DashboardSummaryDTO executeSingleParking(final UUID tenantId, final UUID parkingId) {
    final ParkingLots parkingLot = parkingLotsRepository.findById(parkingId)
        .orElseThrow(() -> new ParkingNotExistsException(parkingId));
    if (!parkingLot.getTenant().id().equals(tenantId)) {
      throw new ParkingNotExistsException(parkingId);
    }

    final LocalDate today = LocalDate.now();
    final Optional<DailySummaryModel> dailyOpt = dailyGateway.findByParkingLotIdAndSummaryDate(parkingId, today);
    final Optional<HourlyOccupancyModel> latestHourlyOpt = hourlyGateway.findLatestByParkingLotId(parkingId);

    final int totalCapacity;
    final double occupancyRate;
    if (latestHourlyOpt.isPresent()) {
      final HourlyOccupancyModel latest = latestHourlyOpt.get();
      totalCapacity = latest.getTotalCapacity() != null ? latest.getTotalCapacity().intValue() : 0;
      occupancyRate = latest.getEstimatedOccupancyRate() != null ? latest.getEstimatedOccupancyRate() : 0.0;
    } else {
      totalCapacity = 0;
      occupancyRate = 0.0;
    }

    final int occupied = (int) Math.round(totalCapacity * (occupancyRate / 100.0));
    final int available = Math.max(0, totalCapacity - occupied);

    if (dailyOpt.isPresent()) {
      final DailySummaryModel d = dailyOpt.get();
      return DashboardSummaryDTO.builder()
          .scope("SINGLE")
          .parkingId(parkingId)
          .totalCapacity(totalCapacity)
          .occupiedSlots(occupied)
          .availableSlots(available)
          .occupancyRate(occupancyRate)
          .todayRevenue(d.getTotalRevenue() != null ? d.getTotalRevenue() : BigDecimal.ZERO)
          .currency(d.getCurrency() != null ? d.getCurrency() : "COP")
          .avgStayMinutes(d.getAvgDurationMinutes())
          .totalTickets(d.getTotalTickets())
          .activeTickets(d.getOngoingTickets())
          .completedTickets(d.getCompletedTickets())
          .build();
    }

    return DashboardSummaryDTO.builder()
        .scope("SINGLE")
        .parkingId(parkingId)
        .totalCapacity(totalCapacity)
        .occupiedSlots(occupied)
        .availableSlots(available)
        .occupancyRate(occupancyRate)
        .todayRevenue(BigDecimal.ZERO)
        .currency("COP")
        .avgStayMinutes(0.0)
        .totalTickets(0L)
        .activeTickets(0L)
        .completedTickets(0L)
        .build();
  }

  private DashboardSummaryDTO executeGlobalTenant(final UUID tenantId) {
    final LocalDate today = LocalDate.now();
    final List<DailySummaryModel> dailySummaries = dailyGateway.findAllByTenantIdAndSummaryDate(tenantId, today);
    final List<DailySummaryModel> summaries = dailySummaries.isEmpty()
        ? dailyGateway.findAllByTenantId(tenantId)
        : dailySummaries;

    final long totalTickets = summaries.stream()
        .mapToLong(s -> s.getTotalTickets() != null ? s.getTotalTickets() : 0L)
        .sum();
    final long completedTickets = summaries.stream()
        .mapToLong(s -> s.getCompletedTickets() != null ? s.getCompletedTickets() : 0L)
        .sum();
    final long ongoingTickets = summaries.stream()
        .mapToLong(s -> s.getOngoingTickets() != null ? s.getOngoingTickets() : 0L)
        .sum();
    final BigDecimal totalRevenue = summaries.stream()
        .map(s -> s.getTotalRevenue() != null ? s.getTotalRevenue() : BigDecimal.ZERO)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    final double avgStay = summaries.stream()
        .filter(s -> s.getAvgDurationMinutes() != null && s.getAvgDurationMinutes() > 0)
        .mapToDouble(DailySummaryModel::getAvgDurationMinutes)
        .average()
        .orElse(0.0);
    final double roundedAvgStay = Math.round(avgStay * 10.0) / 10.0;

    final String currency = summaries.stream()
        .map(DailySummaryModel::getCurrency)
        .filter(c -> c != null && !c.isBlank())
        .findFirst()
        .orElse("COP");

    final List<HourlyOccupancyModel> hourlyList = hourlyGateway.findByTenantId(tenantId);
    final int totalCapacity = hourlyList.stream()
        .mapToInt(h -> h.getTotalCapacity() != null ? h.getTotalCapacity().intValue() : 0)
        .sum();

    final int totalOccupied = hourlyList.stream()
        .filter(h -> h.getTotalCapacity() != null && h.getEstimatedOccupancyRate() != null)
        .mapToInt(h -> (int) Math.round(h.getTotalCapacity() * (h.getEstimatedOccupancyRate() / 100.0)))
        .sum();

    final double globalOccupancyRate = totalCapacity > 0
        ? Math.round((totalOccupied * 100.0 / totalCapacity) * 100.0) / 100.0
        : 0.0;
    final int available = Math.max(0, totalCapacity - totalOccupied);

    return DashboardSummaryDTO.builder()
        .scope("GLOBAL")
        .parkingId(null)
        .totalCapacity(totalCapacity)
        .occupiedSlots(totalOccupied)
        .availableSlots(available)
        .occupancyRate(globalOccupancyRate)
        .todayRevenue(totalRevenue)
        .currency(currency)
        .avgStayMinutes(avgStay)
        .totalTickets(totalTickets)
        .activeTickets(ongoingTickets)
        .completedTickets(completedTickets)
        .build();
  }
}
