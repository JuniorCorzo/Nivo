package dev.angelcorzo.nivo.domain.model.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySummaryModel {
  private UUID parkingLotId;
  private UUID tenantId;
  private String parkingName;
  private LocalDate summaryDate;
  private Long totalTickets;
  private Long completedTickets;
  private Long ongoingTickets;
  private Long uniqueVehicles;
  private BigDecimal totalRevenue;
  private Double avgDurationMinutes;
  private String currency;
}
