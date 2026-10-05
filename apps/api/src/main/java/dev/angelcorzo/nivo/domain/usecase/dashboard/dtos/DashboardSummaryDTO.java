package dev.angelcorzo.nivo.domain.usecase.dashboard.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Aggregated operational and financial summary for dashboard KPIs")
public class DashboardSummaryDTO {

  @Schema(description = "Scope of the summary (GLOBAL across tenant or SINGLE for specific parking)", example = "GLOBAL")
  private String scope;

  @Schema(description = "Parking lot identifier when in SINGLE scope, null when in GLOBAL scope", example = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d")
  private UUID parkingId;

  @Schema(description = "Total capacity of parking slots", example = "150")
  private Integer totalCapacity;

  @Schema(description = "Currently occupied parking slots", example = "90")
  private Integer occupiedSlots;

  @Schema(description = "Currently available parking slots", example = "60")
  private Integer availableSlots;

  @Schema(description = "Current occupancy rate percentage (0.0 - 100.0)", example = "60.0")
  private Double occupancyRate;

  @Schema(description = "Total revenue collected today", example = "450000.00")
  private BigDecimal todayRevenue;

  @Schema(description = "Currency code used for transactions", example = "COP")
  private String currency;

  @Schema(description = "Average stay duration in minutes for completed parking sessions", example = "45.5")
  private Double avgStayMinutes;

  @Schema(description = "Total tickets generated today", example = "120")
  private Long totalTickets;

  @Schema(description = "Active tickets currently in progress (vehicles parked)", example = "35")
  private Long activeTickets;

  @Schema(description = "Completed tickets finalized today", example = "85")
  private Long completedTickets;
}
