package dev.angelcorzo.nivo.domain.usecase.dashboard.strategy;

import dev.angelcorzo.nivo.domain.model.dashboard.DailySummaryModel;
import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.DashboardSummaryQuery;
import dev.angelcorzo.nivo.domain.usecase.dashboard.calculator.DashboardMetricsCalculator;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.OptionalDouble;
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
    final LocalDate effectiveDate = query.targetDate();

    final List<LocalDate> summaryDates = List.of(effectiveDate, effectiveDate.minusDays(7));
    final List<DailySummaryModel> dailySummaries = dailyGateway.findAllByTenantIdAndSummaryDates(tenantId,
      summaryDates);

    final List<DailySummaryModel> todaySummaries = dailySummaries.stream()
      .filter(s -> effectiveDate.equals(s.getSummaryDate()))
      .toList();
    final List<DailySummaryModel> prevSummaries = dailySummaries.stream()
      .filter(s -> effectiveDate.minusDays(7).equals(s.getSummaryDate()))
      .toList();

    final List<DailySummaryModel> summaries = !todaySummaries.isEmpty()
      ? todaySummaries
      : dailyGateway.findAllByTenantId(tenantId);

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
    final BigDecimal digitalRevenue = summaries.stream()
      .map(s -> s.getDigitalRevenue() != null ? s.getDigitalRevenue() : BigDecimal.ZERO)
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

    final Double digitalPaymentRatio = DashboardMetricsCalculator.calculateDigitalPaymentRatio(totalRevenue,
      digitalRevenue);

    final Double revenueDeltaPercentage;
    final Double avgStayDeltaMinutes;

    if (!prevSummaries.isEmpty()) {
      final BigDecimal prevRevenue = prevSummaries.stream()
        .map(s -> s.getTotalRevenue() != null ? s.getTotalRevenue() : BigDecimal.ZERO)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
      revenueDeltaPercentage = DashboardMetricsCalculator.calculateRevenueDeltaPercentage(totalRevenue, prevRevenue);

      final OptionalDouble prevAvgOpt = prevSummaries.stream()
        .filter(s -> s.getAvgDurationMinutes() != null && s.getAvgDurationMinutes() > 0)
        .mapToDouble(DailySummaryModel::getAvgDurationMinutes)
        .average();
      if (prevAvgOpt.isPresent()) {
        final double prevRoundedAvgStay = Math.round(prevAvgOpt.getAsDouble() * 10.0) / 10.0;
        avgStayDeltaMinutes = DashboardMetricsCalculator.calculateAvgStayDeltaMinutes(roundedAvgStay,
          prevRoundedAvgStay);
      } else {
        avgStayDeltaMinutes = null;
      }
    } else {
      revenueDeltaPercentage = null;
      avgStayDeltaMinutes = null;
    }

    final List<ParkingLotListItem> parkings = parkingLotsRepository.findByTenantId(tenantId);
    final int totalCapacity;
    final int totalOccupied;

    if (!parkings.isEmpty()) {
      totalCapacity = parkings.stream()
        .mapToInt(p -> p.totalCapacity() != null ? p.totalCapacity().intValue() : 0)
        .sum();

      final int calculatedOccupied = parkings.stream()
        .filter(p -> p.totalCapacity() != null && p.occuppationRate() != null)
        .mapToInt(p -> (int) Math.round(p.totalCapacity() * (p.occuppationRate() / 100.0)))
        .sum();

      if (calculatedOccupied == 0 && ongoingTickets > 0) {
        totalOccupied = (int) Math.min(totalCapacity, ongoingTickets);
      } else {
        totalOccupied = calculatedOccupied;
      }
    } else {
      final List<HourlyOccupancyModel> hourlyList = hourlyGateway.findByTenantId(tenantId);
      totalCapacity = hourlyList.stream()
        .mapToInt(h -> h.getTotalCapacity() != null ? h.getTotalCapacity().intValue() : 0)
        .sum();

      totalOccupied = hourlyList.stream()
        .filter(h -> h.getTotalCapacity() != null && h.getEstimatedOccupancyRate() != null)
        .mapToInt(h -> (int) Math.round(h.getTotalCapacity() * (h.getEstimatedOccupancyRate() / 100.0)))
        .sum();
    }

    final double globalOccupancyRate = totalCapacity > 0
      ? Math.round((totalOccupied * 100.0 / totalCapacity) * 100.0) / 100.0 : 0.0;
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
      .avgStayMinutes(roundedAvgStay)
      .totalTickets(totalTickets)
      .activeTickets(ongoingTickets)
      .completedTickets(completedTickets)
      .revenueDeltaPercentage(revenueDeltaPercentage)
      .avgStayDeltaMinutes(avgStayDeltaMinutes)
      .digitalPaymentRatio(digitalPaymentRatio)
      .gracePeriodMinutes(null)
      .build();
  }
}
