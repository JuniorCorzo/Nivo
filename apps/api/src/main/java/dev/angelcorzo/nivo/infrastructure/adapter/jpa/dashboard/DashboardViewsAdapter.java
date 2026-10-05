package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard;

import dev.angelcorzo.nivo.domain.model.dashboard.DailySummaryModel;
import dev.angelcorzo.nivo.domain.model.dashboard.HourlyOccupancyModel;
import dev.angelcorzo.nivo.domain.model.dashboard.OperationalReportModel;
import dev.angelcorzo.nivo.domain.model.dashboard.PageResult;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.DailySummaryGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.HourlyOccupancyGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.OperationalReportGateway;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.DailySummaryViewRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.HourlyOccupancyViewRepository;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.OperationalReportViewRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DashboardViewsAdapter
    implements DailySummaryGateway, HourlyOccupancyGateway, OperationalReportGateway {

  private final DailySummaryViewRepository dailySummaryRepository;
  private final HourlyOccupancyViewRepository hourlyOccupancyRepository;
  private final OperationalReportViewRepository operationalReportRepository;

  @Override
  public Optional<DailySummaryModel> findByParkingLotIdAndSummaryDate(
      final UUID parkingLotId, final LocalDate summaryDate) {
    return dailySummaryRepository
        .findByParkingLotIdAndSummaryDate(parkingLotId, summaryDate)
        .map(this::toModel);
  }

  @Override
  public List<DailySummaryModel> findAllByTenantIdAndSummaryDate(
      final UUID tenantId, final LocalDate summaryDate) {
    return dailySummaryRepository.findAllByTenantIdAndSummaryDate(tenantId, summaryDate).stream()
        .map(this::toModel)
        .toList();
  }

  @Override
  public List<DailySummaryModel> findAllByTenantId(final UUID tenantId) {
    return dailySummaryRepository.findAllByTenantId(tenantId).stream()
        .map(this::toModel)
        .toList();
  }

  @Override
  public List<DailySummaryModel> findAllByTenantIdAndParkingLotId(
      final UUID tenantId, final UUID parkingLotId) {
    return dailySummaryRepository.findAllByTenantIdAndParkingLotId(tenantId, parkingLotId).stream()
        .map(this::toModel)
        .toList();
  }

  @Override
  public List<HourlyOccupancyModel> findByParkingLotId(final UUID parkingLotId) {
    return hourlyOccupancyRepository.findByParkingLotId(parkingLotId).stream()
        .map(this::toModel)
        .toList();
  }

  @Override
  public Optional<HourlyOccupancyModel> findLatestByParkingLotId(final UUID parkingLotId) {
    return hourlyOccupancyRepository
        .findFirstByParkingLotIdOrderByHourBucketDesc(parkingLotId)
        .map(this::toModel);
  }

  @Override
  public List<HourlyOccupancyModel> findByTenantId(final UUID tenantId) {
    return hourlyOccupancyRepository.findByTenantId(tenantId).stream()
        .map(this::toModel)
        .toList();
  }

  @Override
  public List<HourlyOccupancyModel> findByTenantIdAndParkingLotId(
      final UUID tenantId, final UUID parkingLotId) {
    return hourlyOccupancyRepository.findByTenantIdAndParkingLotId(tenantId, parkingLotId).stream()
        .map(this::toModel)
        .toList();
  }

  @Override
  public List<HourlyOccupancyModel> findByTenantIdAndParkingLotIdAndHourBucketBetween(
      final UUID tenantId, final UUID parkingLotId, final OffsetDateTime start, final OffsetDateTime end) {
    return hourlyOccupancyRepository
        .findByTenantIdAndParkingLotIdAndHourBucketBetween(tenantId, parkingLotId, start, end)
        .stream()
        .map(this::toModel)
        .toList();
  }

  @Override
  public List<HourlyOccupancyModel> findByTenantIdAndHourBucketBetween(
      final UUID tenantId, final OffsetDateTime start, final OffsetDateTime end) {
    return hourlyOccupancyRepository.findByTenantIdAndHourBucketBetween(tenantId, start, end).stream()
        .map(this::toModel)
        .toList();
  }

  @Override
  public PageResult<OperationalReportModel> findOperationalReports(
      final UUID tenantId, final UUID parkingLotId, final int page, final int size) {
    final PageRequest pageable = PageRequest.of(page, size);
    final Page<OperationalReportViewEntity> result;
    if (parkingLotId != null) {
      result = operationalReportRepository.findAllByTenantIdAndParkingLotId(tenantId, parkingLotId, pageable);
    } else {
      result = operationalReportRepository.findAllByTenantId(tenantId, pageable);
    }
    return PageResult.<OperationalReportModel>builder()
        .content(result.getContent().stream().map(this::toModel).toList())
        .pageNumber(result.getNumber())
        .pageSize(result.getSize())
        .totalElements(result.getTotalElements())
        .totalPages(result.getTotalPages())
        .build();
  }

  @Override
  public List<OperationalReportModel> findAllForExport(final UUID tenantId, final UUID parkingLotId) {
    final List<OperationalReportViewEntity> list;
    if (parkingLotId != null) {
      list = operationalReportRepository.findAllByTenantId(tenantId).stream()
          .filter(e -> parkingLotId.equals(e.getParkingLotId()))
          .toList();
    } else {
      list = operationalReportRepository.findAllByTenantId(tenantId);
    }
    return list.stream().map(this::toModel).toList();
  }

  private DailySummaryModel toModel(final DailySummaryViewEntity e) {
    return DailySummaryModel.builder()
        .parkingLotId(e.getParkingLotId())
        .tenantId(e.getTenantId())
        .parkingName(e.getParkingName())
        .summaryDate(e.getSummaryDate())
        .totalTickets(e.getTotalTickets())
        .completedTickets(e.getCompletedTickets())
        .ongoingTickets(e.getOngoingTickets())
        .uniqueVehicles(e.getUniqueVehicles())
        .totalRevenue(e.getTotalRevenue())
        .avgDurationMinutes(e.getAvgDurationMinutes())
        .currency(e.getCurrency())
        .build();
  }

  private HourlyOccupancyModel toModel(final HourlyOccupancyViewEntity e) {
    return HourlyOccupancyModel.builder()
        .tenantId(e.getTenantId())
        .parkingLotId(e.getParkingLotId())
        .hourBucket(e.getHourBucket())
        .checkins(e.getCheckins())
        .checkouts(e.getCheckouts())
        .totalCapacity(e.getTotalCapacity())
        .estimatedOccupancyRate(e.getEstimatedOccupancyRate())
        .build();
  }

  private OperationalReportModel toModel(final OperationalReportViewEntity e) {
    return OperationalReportModel.builder()
        .ticketId(e.getTicketId())
        .tenantId(e.getTenantId())
        .parkingLotId(e.getParkingLotId())
        .parkingName(e.getParkingName())
        .licensePlate(e.getLicensePlate())
        .slotNumber(e.getSlotNumber())
        .slotZone(e.getSlotZone())
        .slotPrefix(e.getSlotPrefix())
        .slotType(e.getSlotType())
        .rateName(e.getRateName())
        .entryTime(e.getEntryTime())
        .exitTime(e.getExitTime())
        .durationMinutes(e.getDurationMinutes())
        .ticketStatus(e.getTicketStatus())
        .totalToCharge(e.getTotalToCharge())
        .paymentId(e.getPaymentId())
        .paymentStatus(e.getPaymentStatus())
        .paymentMethod(e.getPaymentMethod())
        .paidAmount(e.getPaidAmount())
        .paymentDate(e.getPaymentDate())
        .operatorOrUserName(e.getOperatorOrUserName())
        .userEmail(e.getUserEmail())
        .build();
  }
}
