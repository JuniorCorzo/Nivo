package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "v_parking_daily_summary")
@IdClass(DailySummaryId.class)
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySummaryViewEntity {

  @Id
  @Column(name = "parking_lot_id")
  private UUID parkingLotId;

  @Column(name = "tenant_id")
  private UUID tenantId;

  @Column(name = "parking_name")
  private String parkingName;

  @Id
  @Column(name = "summary_date")
  private LocalDate summaryDate;

  @Column(name = "total_tickets")
  private Long totalTickets;

  @Column(name = "completed_tickets")
  private Long completedTickets;

  @Column(name = "ongoing_tickets")
  private Long ongoingTickets;

  @Column(name = "unique_vehicles")
  private Long uniqueVehicles;

  @Column(name = "total_revenue")
  private BigDecimal totalRevenue;

  @Column(name = "avg_duration_minutes")
  private Double avgDurationMinutes;

  @Column(name = "currency")
  private String currency;
}
