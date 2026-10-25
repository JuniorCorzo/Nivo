package dev.angelcorzo.nivo.domain.usecase.dashboard.strategy;

import dev.angelcorzo.nivo.domain.model.dashboard.DailySummaryModel;
import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.DashboardSummaryQuery;
import dev.angelcorzo.nivo.domain.usecase.dashboard.calculator.DashboardMetricsCalculator;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
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
    final LocalDate effectiveDate = query.targetDate();

    final ParkingLots parkingLot = parkingLotsRepository.findById(parkingId)
      .orElseThrow(() -> new ParkingNotExistsException(parkingId));
    if (!parkingLot.getTenant().id().equals(tenantId)) {
      throw new ParkingNotExistsException(parkingId);
    }

    final List<LocalDate> summaryDates = List.of(effectiveDate, effectiveDate.minusDays(7));
    final List<DailySummaryModel> summaries = dailyGateway.findByParkingLotIdAndSummaryDates(parkingId, summaryDates);
    final Optional<DailySummaryModel> dailyOpt = summaries.stream()
      .filter(s -> effectiveDate.equals(s.getSummaryDate()))
      .findFirst();
    final Optional<DailySummaryModel> prevDailyOpt = summaries.stream()
      .filter(s -> effectiveDate.minusDays(7).equals(s.getSummaryDate()))
      .findFirst();

    final Optional<HourlyOccupancyModel> latestHourlyOpt = hourlyGateway.findLatestByParkingLotId(parkingId);
    final Optional<ParkingLotListItem> parkingItemOpt = parkingLotsRepository.findByTenantId(tenantId)
      .stream()
      .filter(p -> p.id().equals(parkingId))
      .findFirst();

    final int totalCapacity;
    if (parkingItemOpt.isPresent() && parkingItemOpt.get().totalCapacity() != null
      && parkingItemOpt.get().totalCapacity() > 0) {
      totalCapacity = parkingItemOpt.get().totalCapacity().intValue();
    } else if (latestHourlyOpt.isPresent() && latestHourlyOpt.get().getTotalCapacity() != null
      && latestHourlyOpt.get().getTotalCapacity() > 0) {
      totalCapacity = latestHourlyOpt.get().getTotalCapacity().intValue();
    } else {
      totalCapacity = 0;
    }

    final double occupancyRate;
    if (parkingItemOpt.isPresent() && parkingItemOpt.get().occuppationRate() != null
      && parkingItemOpt.get().occuppationRate() > 0.0) {
      occupancyRate = parkingItemOpt.get().occuppationRate();
    } else if (latestHourlyOpt.isPresent() && latestHourlyOpt.get().getEstimatedOccupancyRate() != null
      && latestHourlyOpt.get().getEstimatedOccupancyRate() > 0.0) {
      occupancyRate = latestHourlyOpt.get().getEstimatedOccupancyRate();
    } else if (dailyOpt.isPresent() && dailyOpt.get().getOngoingTickets() != null
      && dailyOpt.get().getOngoingTickets() > 0 && totalCapacity > 0) {
      occupancyRate = Math.round((dailyOpt.get().getOngoingTickets() * 100.0 / totalCapacity) * 100.0) / 100.0;
    } else if (parkingItemOpt.isPresent() && parkingItemOpt.get().occuppationRate() != null) {
      occupancyRate = parkingItemOpt.get().occuppationRate();
    } else if (latestHourlyOpt.isPresent() && latestHourlyOpt.get().getEstimatedOccupancyRate() != null) {
      occupancyRate = latestHourlyOpt.get().getEstimatedOccupancyRate();
    } else {
      occupancyRate = 0.0;
    }

    final int rawOccupied = (int) Math.round(totalCapacity * (occupancyRate / 100.0));
    final int occupied;
    if (rawOccupied == 0 && dailyOpt.isPresent() && dailyOpt.get().getOngoingTickets() != null
      && dailyOpt.get().getOngoingTickets() > 0) {
      occupied = (int) Math.min(totalCapacity, dailyOpt.get().getOngoingTickets());
    } else {
      occupied = rawOccupied;
    }
    final int available = Math.max(0, totalCapacity - occupied);
    final int gracePeriod = parkingLot.getPolicy().gracePeriodMinutes();

    if (dailyOpt.isPresent()) {
      final DailySummaryModel d = dailyOpt.get();
      final BigDecimal totalRev = d.getTotalRevenue() != null ? d.getTotalRevenue() : BigDecimal.ZERO;
      final BigDecimal prevRev = prevDailyOpt.map(DailySummaryModel::getTotalRevenue).orElse(null);
      final Double prevStay = prevDailyOpt.map(DailySummaryModel::getAvgDurationMinutes).orElse(null);

      final Double revDelta = prevDailyOpt.isPresent()
        ? DashboardMetricsCalculator.calculateRevenueDeltaPercentage(totalRev,
          prevRev != null ? prevRev : BigDecimal.ZERO)
        : null;
      final Double stayDelta = prevDailyOpt.isPresent()
        ? DashboardMetricsCalculator.calculateAvgStayDeltaMinutes(d.getAvgDurationMinutes(), prevStay)
        : null;
      final Double digitalRatio = DashboardMetricsCalculator.calculateDigitalPaymentRatio(totalRev,
        d.getDigitalRevenue());

      return DashboardSummaryDTO.builder()
        .scope("SINGLE")
        .parkingId(parkingId)
        .totalCapacity(totalCapacity)
        .occupiedSlots(occupied)
        .availableSlots(available)
        .occupancyRate(occupancyRate)
        .todayRevenue(totalRev)
        .currency(d.getCurrency() != null ? d.getCurrency() : "COP")
        .avgStayMinutes(d.getAvgDurationMinutes())
        .totalTickets(d.getTotalTickets())
        .activeTickets(d.getOngoingTickets())
        .completedTickets(d.getCompletedTickets())
        .revenueDeltaPercentage(revDelta)
        .avgStayDeltaMinutes(stayDelta)
        .digitalPaymentRatio(digitalRatio)
        .gracePeriodMinutes(gracePeriod)
        .build();
    }

    final List<DailySummaryModel> fallbackSummaries = dailyGateway.findAllByTenantIdAndParkingLotId(tenantId,
      parkingId);

    final String fallbackCurrency = parkingItemOpt.map(ParkingLotListItem::currency)
      .filter(c -> c != null && !c.isBlank())
      .orElse("COP");

    if (!fallbackSummaries.isEmpty()) {
      final long totalTickets = fallbackSummaries.stream()
        .mapToLong(s -> s.getTotalTickets() != null ? s.getTotalTickets() : 0L)
        .sum();
      final long completedTickets = fallbackSummaries.stream()
        .mapToLong(s -> s.getCompletedTickets() != null ? s.getCompletedTickets() : 0L)
        .sum();
      final long ongoingTickets = fallbackSummaries.stream()
        .mapToLong(s -> s.getOngoingTickets() != null ? s.getOngoingTickets() : 0L)
        .sum();
      final BigDecimal totalRevenue = fallbackSummaries.stream()
        .map(s -> s.getTotalRevenue() != null ? s.getTotalRevenue() : BigDecimal.ZERO)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
      final BigDecimal digitalRevenue = fallbackSummaries.stream()
        .map(s -> s.getDigitalRevenue() != null ? s.getDigitalRevenue() : BigDecimal.ZERO)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

      final double avgStay = fallbackSummaries.stream()
        .filter(s -> s.getAvgDurationMinutes() != null && s.getAvgDurationMinutes() > 0)
        .mapToDouble(DailySummaryModel::getAvgDurationMinutes)
        .average()
        .orElse(0.0);
      final double roundedAvgStay = Math.round(avgStay * 10.0) / 10.0;

      final String currency = fallbackSummaries.stream()
        .map(DailySummaryModel::getCurrency)
        .filter(c -> c != null && !c.isBlank())
        .findFirst()
        .orElse(fallbackCurrency);

      final int fallbackOccupied = (occupied == 0 && ongoingTickets > 0)
        ? (int) Math.min(totalCapacity, ongoingTickets) : occupied;
      final int fallbackAvailable = Math.max(0, totalCapacity - fallbackOccupied);
      final Double digitalRatio = DashboardMetricsCalculator.calculateDigitalPaymentRatio(totalRevenue, digitalRevenue);

      return DashboardSummaryDTO.builder()
        .scope("SINGLE")
        .parkingId(parkingId)
        .totalCapacity(totalCapacity)
        .occupiedSlots(fallbackOccupied)
        .availableSlots(fallbackAvailable)
        .occupancyRate(occupancyRate)
        .todayRevenue(totalRevenue)
        .currency(currency)
        .avgStayMinutes(roundedAvgStay)
        .totalTickets(totalTickets)
        .activeTickets(ongoingTickets)
        .completedTickets(completedTickets)
        .revenueDeltaPercentage(null)
        .avgStayDeltaMinutes(null)
        .digitalPaymentRatio(digitalRatio)
        .gracePeriodMinutes(gracePeriod)
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
      .currency(fallbackCurrency)
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
