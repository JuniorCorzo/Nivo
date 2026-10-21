package dev.angelcorzo.nivo.infrastructure.adapter.jpa.dashboard;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "v_parking_occupancy_hourly")
@IdClass(HourlyOccupancyId.class)
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HourlyOccupancyViewEntity {

  @Id
  @Column(name = "tenant_id")
  private UUID tenantId;

  @Id
  @Column(name = "parking_lot_id")
  private UUID parkingLotId;

  @Id
  @Column(name = "hour_bucket")
  private OffsetDateTime hourBucket;

  @Column(name = "checkins")
  private Long checkins;

  @Column(name = "checkouts")
  private Long checkouts;

  @Column(name = "total_capacity")
  private Long totalCapacity;

  @Column(name = "estimated_occupancy_rate")
  private Double estimatedOccupancyRate;
}
