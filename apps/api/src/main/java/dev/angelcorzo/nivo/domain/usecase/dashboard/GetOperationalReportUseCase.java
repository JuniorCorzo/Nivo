package dev.angelcorzo.nivo.domain.usecase.dashboard;

import dev.angelcorzo.nivo.domain.model.authentication.gateway.AuthenticationContextGateway;
import dev.angelcorzo.nivo.domain.model.dashboard.OperationalReportModel;
import dev.angelcorzo.nivo.domain.model.dashboard.PageResult;
import dev.angelcorzo.nivo.domain.model.dashboard.gateways.OperationalReportGateway;
import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.OperationalReportDTO;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class GetOperationalReportUseCase {

  private final OperationalReportGateway reportGateway;
  private final AuthenticationContextGateway authenticationContext;

  public PageResult<OperationalReportDTO> execute(
      final UUID parkingId, final int page, final int size) {
    final UUID tenantId = authenticationContext.getCurrentTenantId();
    return execute(tenantId, parkingId, page, size);
  }

  public PageResult<OperationalReportDTO> execute(
      final UUID tenantId, final UUID parkingId, final int page, final int size) {
    final PageResult<OperationalReportModel> pageResult =
        reportGateway.findOperationalReports(tenantId, parkingId, page, size);
    return PageResult.<OperationalReportDTO>builder()
        .content(pageResult.getContent().stream().map(this::toDTO).toList())
        .pageNumber(pageResult.getPageNumber())
        .pageSize(pageResult.getPageSize())
        .totalElements(pageResult.getTotalElements())
        .totalPages(pageResult.getTotalPages())
        .build();
  }

  public List<OperationalReportDTO> executeForExport(final UUID parkingId) {
    final UUID tenantId = authenticationContext.getCurrentTenantId();
    return executeForExport(tenantId, parkingId);
  }

  public List<OperationalReportDTO> executeForExport(final UUID tenantId, final UUID parkingId) {
    return reportGateway.findAllForExport(tenantId, parkingId).stream()
        .map(this::toDTO)
        .toList();
  }

  private OperationalReportDTO toDTO(final OperationalReportModel e) {
    return OperationalReportDTO.builder()
        .ticketId(e.getTicketId())
        .parkingId(e.getParkingLotId())
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
