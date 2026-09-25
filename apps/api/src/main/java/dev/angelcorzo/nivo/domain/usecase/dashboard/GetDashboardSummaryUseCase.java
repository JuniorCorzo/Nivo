package dev.angelcorzo.nivo.domain.usecase.dashboard;

import dev.angelcorzo.nivo.domain.model.dashboard.DailySummaryModel;
import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetDashboardSummaryUseCase {

  private final DailySummaryGateway dailyGateway;
  private final HourlyOccupancyGateway hourlyGateway;
  private final ParkingLotsRepository parkingLotsRepository;

  public DashboardSummaryDTO execute(UUID tenantId, UUID parkingId) {
    LocalDate today = LocalDate.now();

    if (parkingId != null) {
      var parkingLot = parkingLotsRepository.findById(parkingId)
          .orElseThrow(() -> new IllegalArgumentException("Parking lot not found: " + parkingId));
      if (!parkingLot.getTenant().id().equals(tenantId)) {
        throw new IllegalArgumentException("Parking lot does not belong to tenant");
      }

      var dailyOpt = dailyGateway.findByParkingLotIdAndSummaryDate(parkingId, today);
      var hourlyList = hourlyGateway.findByParkingLotId(parkingId);

      int totalCapacity = 0;
      double occupancyRate = 0.0;
      if (!hourlyList.isEmpty()) {
        var latest = hourlyList.getLast();
        totalCapacity = latest.getTotalCapacity() != null ? latest.getTotalCapacity().intValue() : 0;
        occupancyRate = latest.getEstimatedOccupancyRate() != null ? latest.getEstimatedOccupancyRate() : 0.0;
      }

      int occupied = (int) Math.round(totalCapacity * (occupancyRate / 100.0));
      int available = Math.max(0, totalCapacity - occupied);

      if (dailyOpt.isPresent()) {
        var d = dailyOpt.get();
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

    var summaries = dailyGateway.findAllByTenantIdAndSummaryDate(tenantId, today);
    if (summaries.isEmpty()) {
      summaries = dailyGateway.findAllByTenantId(tenantId);
    }

    long totalTickets = 0;
    long completedTickets = 0;
    long ongoingTickets = 0;
    BigDecimal totalRevenue = BigDecimal.ZERO;
    double durationSum = 0;
    int durationCount = 0;
    String currency = "COP";

    for (DailySummaryModel s : summaries) {
      if (s.getTotalTickets() != null) totalTickets += s.getTotalTickets();
      if (s.getCompletedTickets() != null) completedTickets += s.getCompletedTickets();
      if (s.getOngoingTickets() != null) ongoingTickets += s.getOngoingTickets();
      if (s.getTotalRevenue() != null) totalRevenue = totalRevenue.add(s.getTotalRevenue());
      if (s.getAvgDurationMinutes() != null && s.getAvgDurationMinutes() > 0) {
        durationSum += s.getAvgDurationMinutes();
        durationCount++;
      }
      if (s.getCurrency() != null) currency = s.getCurrency();
    }

    var hourlyList = hourlyGateway.findByTenantId(tenantId);
    int totalCapacity = 0;
    int totalOccupied = 0;
    for (HourlyOccupancyModel h : hourlyList) {
      if (h.getTotalCapacity() != null) {
        totalCapacity += h.getTotalCapacity().intValue();
        if (h.getEstimatedOccupancyRate() != null) {
          totalOccupied += (int) Math.round(h.getTotalCapacity() * (h.getEstimatedOccupancyRate() / 100.0));
        }
      }
    }

    double globalOccupancyRate = totalCapacity > 0
        ? Math.round((totalOccupied * 100.0 / totalCapacity) * 100.0) / 100.0
        : 0.0;
    int available = Math.max(0, totalCapacity - totalOccupied);
    double avgStay = durationCount > 0 ? Math.round((durationSum / durationCount) * 10.0) / 10.0 : 0.0;

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
