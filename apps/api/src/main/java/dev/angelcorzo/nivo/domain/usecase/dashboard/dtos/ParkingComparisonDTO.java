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
@Schema(description = "Comparison metrics for a specific parking facility in multi-branch views")
public class ParkingComparisonDTO {

  @Schema(description = "Unique identifier of the parking facility", example = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d")
  private UUID parkingId;

  @Schema(description = "Commercial name of the parking facility", example = "Sede Centro")
  private String parkingName;

  @Schema(description = "Total number of parking slots in this facility", example = "80")
  private Integer totalSlots;

  @Schema(description = "Currently occupied slots in this facility", example = "52")
  private Integer occupiedSlots;

  @Schema(description = "Current occupancy rate percentage (0.0 - 100.0)", example = "65.0")
  private Double occupancyRate;

  @Schema(description = "Total revenue collected today in this facility", example = "280000.00")
  private BigDecimal todayRevenue;

  @Schema(description = "Currency code used for transactions", example = "COP")
  private String currency;

  @Schema(description = "Active tickets currently in progress in this facility", example = "22")
  private Long activeTickets;

  @Schema(description = "Average stay duration in minutes in this facility", example = "42.0")
  private Double avgStayMinutes;
}
