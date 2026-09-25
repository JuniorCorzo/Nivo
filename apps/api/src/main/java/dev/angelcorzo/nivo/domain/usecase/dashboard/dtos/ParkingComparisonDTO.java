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
public class ParkingComparisonDTO {
  private UUID parkingId;
  private String parkingName;
  private Integer totalSlots;
  private Integer occupiedSlots;
  private Double occupancyRate;
  private BigDecimal todayRevenue;
  private String currency;
  private Long activeTickets;
  private Double avgStayMinutes;
}
