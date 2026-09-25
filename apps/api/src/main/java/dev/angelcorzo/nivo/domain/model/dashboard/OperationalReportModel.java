package dev.angelcorzo.nivo.domain.model.dashboard;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationalReportModel {
  private UUID ticketId;
  private UUID tenantId;
  private UUID parkingLotId;
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
