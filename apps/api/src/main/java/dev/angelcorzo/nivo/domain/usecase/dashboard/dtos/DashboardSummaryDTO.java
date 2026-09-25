package dev.angelcorzo.nivo.domain.usecase.dashboard.dtos;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
  private String scope;
  private UUID parkingId;
  private Integer totalCapacity;
  private Integer occupiedSlots;
  private Integer availableSlots;
  private Double occupancyRate;
  private BigDecimal todayRevenue;
  private String currency;
  private Double avgStayMinutes;
  private Long totalTickets;
  private Long activeTickets;
  private Long completedTickets;
}
