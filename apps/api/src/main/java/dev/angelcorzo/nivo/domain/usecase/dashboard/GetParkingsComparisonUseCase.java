package dev.angelcorzo.nivo.domain.usecase.dashboard;

import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.ParkingComparisonDTO;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.DailySummaryViewRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.HourlyOccupancyViewRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetParkingsComparisonUseCase {

  private final DailySummaryViewRepository dailyRepository;
  private final HourlyOccupancyViewRepository hourlyRepository;
  private final ParkingLotsRepository parkingLotsRepository;

  public List<ParkingComparisonDTO> execute(UUID tenantId, LocalDate startDate, LocalDate endDate) {
    LocalDate today = LocalDate.now();
    var parkings = parkingLotsRepository.findByTenantId(tenantId);
    List<ParkingComparisonDTO> comparisonList = new ArrayList<>();

    for (var p : parkings) {
      UUID parkingId = p.id();
      var summaryOpt = dailyRepository.findByParkingLotIdAndSummaryDate(parkingId, today);
      var hourlyList = hourlyRepository.findByParkingLotId(parkingId);

      int totalCapacity = p.totalCapacity() != null ? p.totalCapacity().intValue() : 0;
      double occupancyRate = 0.0;
      if (!hourlyList.isEmpty()) {
        var latest = hourlyList.getLast();
        if (latest.getTotalCapacity() != null && latest.getTotalCapacity() > 0) {
          totalCapacity = latest.getTotalCapacity().intValue();
        }
        occupancyRate = latest.getEstimatedOccupancyRate() != null ? latest.getEstimatedOccupancyRate() : 0.0;
      }

      int occupied = (int) Math.round(totalCapacity * (occupancyRate / 100.0));
      BigDecimal revenue = BigDecimal.ZERO;
      long activeTickets = 0;
      double avgStay = 0.0;

      if (summaryOpt.isPresent()) {
        var s = summaryOpt.get();
        if (s.getTotalRevenue() != null) revenue = s.getTotalRevenue();
        if (s.getOngoingTickets() != null) activeTickets = s.getOngoingTickets();
        if (s.getAvgDurationMinutes() != null) avgStay = s.getAvgDurationMinutes();
      }

      comparisonList.add(ParkingComparisonDTO.builder()
          .parkingId(parkingId)
          .parkingName(p.name())
          .totalSlots(totalCapacity)
          .occupiedSlots(occupied)
          .occupancyRate(occupancyRate)
          .todayRevenue(revenue)
          .currency(p.currency() != null ? p.currency() : "COP")
          .activeTickets(activeTickets)
          .avgStayMinutes(avgStay)
          .build());
    }

    comparisonList.sort((a, b) -> Double.compare(b.getOccupancyRate(), a.getOccupancyRate()));
    return comparisonList;
  }
}
