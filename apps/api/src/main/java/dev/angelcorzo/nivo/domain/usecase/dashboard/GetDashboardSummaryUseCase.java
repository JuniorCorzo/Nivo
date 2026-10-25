package dev.angelcorzo.nivo.domain.usecase.dashboard;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.DailySummaryModel;
import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLotListItem;
import dev.angelcorzo.nivo.domain.model.parkinglots.ParkingLots;
import dev.angelcorzo.nivo.domain.model.parkinglots.exceptions.ParkingNotExistsException;
import dev.angelcorzo.nivo.domain.model.parkinglots.gateways.ParkingLotsRepository;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.DashboardSummaryDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.OptionalDouble;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetDashboardSummaryUseCase {

  private final DailySummaryGateway dailyGateway;
  private final HourlyOccupancyGateway hourlyGateway;
  private final ParkingLotsRepository parkingLotsRepository;
  private final AuthenticationContextGateway authenticationContext;

  public DashboardSummaryDTO execute(final UUID parkingId) {
    return execute(parkingId, LocalDate.now());
  }

  public DashboardSummaryDTO execute(final UUID parkingId, final LocalDate targetDate) {
    final UUID tenantId = authenticationContext.getCurrentTenantId();
    return execute(tenantId, parkingId, targetDate);
  }

  public DashboardSummaryDTO execute(final UUID tenantId, final UUID parkingId) {
    return execute(tenantId, parkingId, LocalDate.now());
  }

  public DashboardSummaryDTO execute(final UUID tenantId, final UUID parkingId, final LocalDate targetDate) {
    final LocalDate effectiveDate = targetDate != null ? targetDate : LocalDate.now();
    if (parkingId != null) {
      return executeSingleParking(tenantId, parkingId, effectiveDate);
    }
    return executeGlobalTenant(tenantId, effectiveDate);
  }

  private DashboardSummaryDTO executeSingleParking(final UUID tenantId, final UUID parkingId,
    final LocalDate effectiveDate) {
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
        ? calculateRevenueDeltaPercentage(totalRev, prevRev != null ? prevRev : BigDecimal.ZERO)
        : null;
      final Double stayDelta = prevDailyOpt.isPresent()
        ? calculateAvgStayDeltaMinutes(d.getAvgDurationMinutes(), prevStay)
        : null;
      final Double digitalRatio = calculateDigitalPaymentRatio(totalRev, d.getDigitalRevenue());

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
      final Double digitalRatio = calculateDigitalPaymentRatio(totalRevenue, digitalRevenue);

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

  private DashboardSummaryDTO executeGlobalTenant(final UUID tenantId, final LocalDate effectiveDate) {
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

    final Double digitalPaymentRatio = calculateDigitalPaymentRatio(totalRevenue, digitalRevenue);

    final Double revenueDeltaPercentage;
    final Double avgStayDeltaMinutes;

    if (!prevSummaries.isEmpty()) {
      final BigDecimal prevRevenue = prevSummaries.stream()
        .map(s -> s.getTotalRevenue() != null ? s.getTotalRevenue() : BigDecimal.ZERO)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
      revenueDeltaPercentage = calculateRevenueDeltaPercentage(totalRevenue, prevRevenue);

      final OptionalDouble prevAvgOpt = prevSummaries.stream()
        .filter(s -> s.getAvgDurationMinutes() != null && s.getAvgDurationMinutes() > 0)
        .mapToDouble(DailySummaryModel::getAvgDurationMinutes)
        .average();
      if (prevAvgOpt.isPresent()) {
        final double prevRoundedAvgStay = Math.round(prevAvgOpt.getAsDouble() * 10.0) / 10.0;
        avgStayDeltaMinutes = calculateAvgStayDeltaMinutes(roundedAvgStay, prevRoundedAvgStay);
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

  private Double calculateRevenueDeltaPercentage(final BigDecimal currentRevenue, final BigDecimal previousRevenue) {
    if (previousRevenue == null) {
      return null;
    }
    if (previousRevenue.compareTo(BigDecimal.ZERO) > 0) {
      final double cur = currentRevenue != null ? currentRevenue.doubleValue() : 0.0;
      final double prev = previousRevenue.doubleValue();
      final double delta = ((cur - prev) / prev) * 100.0;
      return Math.round(delta * 10.0) / 10.0;
    }
    if (currentRevenue != null && currentRevenue.compareTo(BigDecimal.ZERO) > 0) {
      return 100.0;
    }
    return 0.0;
  }

  private Double calculateAvgStayDeltaMinutes(final Double currentAvgStay, final Double previousAvgStay) {
    if (currentAvgStay == null || previousAvgStay == null) {
      return null;
    }
    final double delta = currentAvgStay - previousAvgStay;
    return Math.round(delta * 10.0) / 10.0;
  }

  private Double calculateDigitalPaymentRatio(final BigDecimal totalRevenue, final BigDecimal digitalRevenue) {
    if (totalRevenue == null || totalRevenue.compareTo(BigDecimal.ZERO) <= 0) {
      return 0.0;
    }
    final double total = totalRevenue.doubleValue();
    final double digital = digitalRevenue != null ? digitalRevenue.doubleValue() : 0.0;
    final double ratio = (digital / total) * 100.0;
    return Math.round(ratio * 10.0) / 10.0;
  }
}
