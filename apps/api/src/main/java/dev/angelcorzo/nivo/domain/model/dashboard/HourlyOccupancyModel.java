package dev.angelcorzo.nivo.domain.model.dashboard;

import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HourlyOccupancyModel {
  private UUID tenantId;
  private UUID parkingLotId;
  private OffsetDateTime hourBucket;
  private Long checkins;
  private Long checkouts;
  private Long totalCapacity;
  private Double estimatedOccupancyRate;
}
