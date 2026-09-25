package dev.angelcorzo.nivo.domain.usecase.dashboard.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Detailed operational and transactional record for ticket auditing and reporting")
public class OperationalReportDTO {

  @Schema(description = "Unique identifier of the parking ticket", example = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d")
  private UUID ticketId;

  @Schema(description = "Parking lot identifier", example = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d")
  private UUID parkingId;

  @Schema(description = "Name of the parking facility", example = "Sede Centro")
  private String parkingName;

  @Schema(description = "Vehicle license plate number", example = "ABC-123")
  private String licensePlate;

  @Schema(description = "Assigned parking slot number or code", example = "A-12")
  private String slotNumber;

  @Schema(description = "Zone or floor where the slot is located", example = "PISO_1")
  private String slotZone;

  @Schema(description = "Slot prefix code", example = "A")
  private String slotPrefix;

  @Schema(description = "Type of slot (CAR, MOTORCYCLE, BICYCLE, TRUCK)", example = "CAR")
  private String slotType;

  @Schema(description = "Applied pricing rate schedule name", example = "Tarifa Plena Autos")
  private String rateName;

  @Schema(description = "Ticket check-in timestamp with timezone", example = "2026-09-25T08:30:00Z")
  private OffsetDateTime entryTime;

  @Schema(description = "Ticket check-out timestamp with timezone, null if still open", example = "2026-09-25T10:15:00Z")
  private OffsetDateTime exitTime;

  @Schema(description = "Parking stay duration in minutes", example = "105.0")
  private Double durationMinutes;

  @Schema(description = "Current lifecycle status of the ticket (OPEN, CLOSED, CANCELLED)", example = "CLOSED")
  private String ticketStatus;

  @Schema(description = "Total amount to charge or charged", example = "7500.00")
  private BigDecimal totalToCharge;

  @Schema(description = "Associated payment transaction ID, null if unpaid", example = "c2d3e4f5-a6b7-8c9d-0e1f-2a3b4c5d6e7f")
  private UUID paymentId;

  @Schema(description = "Payment processing status (PAID, PENDING, FAILED)", example = "PAID")
  private String paymentStatus;

  @Schema(description = "Payment method used (CASH, CARD, PSE, BANCOLOMBIA)", example = "CARD")
  private String paymentMethod;

  @Schema(description = "Total paid amount recorded in payment transaction", example = "7500.00")
  private BigDecimal paidAmount;

  @Schema(description = "Timestamp when payment was recorded", example = "2026-09-25T10:16:30Z")
  private OffsetDateTime paymentDate;

  @Schema(description = "Name of operator or registered user associated with the ticket", example = "Carlos Ramirez")
  private String operatorOrUserName;

  @Schema(description = "Email of customer or operator associated with the ticket", example = "carlos@example.com")
  private String userEmail;
}
