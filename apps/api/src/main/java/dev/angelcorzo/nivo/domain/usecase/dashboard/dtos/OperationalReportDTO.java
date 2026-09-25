package dev.angelcorzo.nivo.domain.usecase.dashboard.dtos;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationalReportDTO {
  private UUID ticketId;
  private UUID parkingId;
  private String parkingName;
  private String licensePlate;
  private String slotNumber;
  private String slotZone;
  private String slotPrefix;
  private String slotType;
  private String rateName;
  private OffsetDateTime entryTime;
  private OffsetDateTime exitTime;
  private Double durationMinutes;
  private String ticketStatus;
  private BigDecimal totalToCharge;
  private UUID paymentId;
  private String paymentStatus;
  private String paymentMethod;
  private BigDecimal paidAmount;
  private OffsetDateTime paymentDate;
  private String operatorOrUserName;
  private String userEmail;
}
