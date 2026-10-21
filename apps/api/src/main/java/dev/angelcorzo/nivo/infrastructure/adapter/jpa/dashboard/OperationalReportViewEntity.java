package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "v_parking_operational_report")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationalReportViewEntity {

  @Id
  @Column(name = "ticket_id")
  private UUID ticketId;

  @Column(name = "tenant_id")
  private UUID tenantId;

  @Column(name = "parking_lot_id")
  private UUID parkingLotId;

  @Column(name = "parking_name")
  private String parkingName;

  @Column(name = "license_plate")
  private String licensePlate;

  @Column(name = "slot_number")
  private String slotNumber;

  @Column(name = "slot_zone")
  private String slotZone;

  @Column(name = "slot_prefix")
  private String slotPrefix;

  @Column(name = "slot_type")
  private String slotType;

  @Column(name = "rate_name")
  private String rateName;

  @Column(name = "entry_time")
  private OffsetDateTime entryTime;

  @Column(name = "exit_time")
  private OffsetDateTime exitTime;

  @Column(name = "duration_minutes")
  private Double durationMinutes;

  @Column(name = "ticket_status")
  private String ticketStatus;

  @Column(name = "total_to_charge")
  private BigDecimal totalToCharge;

  @Column(name = "payment_id")
  private UUID paymentId;

  @Column(name = "payment_status")
  private String paymentStatus;

  @Column(name = "payment_method")
  private String paymentMethod;

  @Column(name = "paid_amount")
  private BigDecimal paidAmount;

  @Column(name = "payment_date")
  private OffsetDateTime paymentDate;

  @Column(name = "operator_or_user_name")
  private String operatorOrUserName;

  @Column(name = "user_email")
  private String userEmail;
}
