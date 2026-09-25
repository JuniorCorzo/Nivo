package dev.angelcorzo.nivo.domain.usecase.dashboard;

import dev.angelcorzo.nivo.domain.usecase.dashboard.dtos.OperationalReportDTO;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.OperationalReportViewEntity;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard.repository.OperationalReportViewRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetOperationalReportUseCase {

  private final OperationalReportViewRepository reportRepository;

  public Page<OperationalReportDTO> execute(UUID tenantId, UUID parkingId, Pageable pageable) {
    Page<OperationalReportViewEntity> page;
    if (parkingId != null) {
      page = reportRepository.findAllByTenantIdAndParkingLotId(tenantId, parkingId, pageable);
    } else {
      page = reportRepository.findAllByTenantId(tenantId, pageable);
    }
    return page.map(this::toDTO);
  }

  public List<OperationalReportDTO> executeForExport(UUID tenantId, UUID parkingId) {
    List<OperationalReportViewEntity> list;
    if (parkingId != null) {
      list = reportRepository.findAllByTenantId(tenantId).stream()
          .filter(e -> parkingId.equals(e.getParkingLotId()))
          .toList();
    } else {
      list = reportRepository.findAllByTenantId(tenantId);
    }
    return list.stream().map(this::toDTO).toList();
  }

  private OperationalReportDTO toDTO(OperationalReportViewEntity e) {
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
