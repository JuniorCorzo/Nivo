package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HourlyOccupancyId implements Serializable {
  private UUID tenantId;
  private UUID parkingLotId;
  private OffsetDateTime hourBucket;

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    HourlyOccupancyId that = (HourlyOccupancyId) o;
    return Objects.equals(tenantId, that.tenantId) &&
           Objects.equals(parkingLotId, that.parkingLotId) &&
           Objects.equals(hourBucket, that.hourBucket);
  }

  @Override
  public int hashCode() {
    return Objects.hash(tenantId, parkingLotId, hourBucket);
  }
}
