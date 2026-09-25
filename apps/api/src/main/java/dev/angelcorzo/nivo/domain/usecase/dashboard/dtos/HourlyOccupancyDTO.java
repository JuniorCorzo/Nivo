package dev.angelcorzo.nivo.domain.usecase.dashboard.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Hourly timeseries point of parking occupancy and traffic flow")
public class HourlyOccupancyDTO {

  @Schema(description = "Parking facility ID if single scope, null if consolidated tenant scope", example = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d")
  private UUID parkingId;

  @Schema(description = "Hour bucket timestamp with timezone", example = "2026-09-25T14:00:00Z")
  private OffsetDateTime hourBucket;

  @Schema(description = "Number of check-ins registered during this hour", example = "18")
  private Long checkins;

  @Schema(description = "Number of check-outs registered during this hour", example = "12")
  private Long checkouts;

  @Schema(description = "Total capacity of slots available during this hour", example = "100")
  private Long totalCapacity;

  @Schema(description = "Estimated occupancy rate percentage during this hour (0.0 - 100.0)", example = "65.5")
  private Double occupancyRate;
}
