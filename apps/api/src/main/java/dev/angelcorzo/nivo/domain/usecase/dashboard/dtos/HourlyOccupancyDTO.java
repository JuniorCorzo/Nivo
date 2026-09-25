package dev.angelcorzo.nivo.domain.usecase.dashboard.dtos;

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
public class HourlyOccupancyDTO {
  private UUID parkingId;
  private OffsetDateTime hourBucket;
  private Long checkins;
  private Long checkouts;
  private Long totalCapacity;
  private Double occupancyRate;
}
