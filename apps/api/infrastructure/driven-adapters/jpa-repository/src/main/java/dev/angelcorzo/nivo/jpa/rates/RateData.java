package dev.angelcorzo.nivo.jpa.rates;

import dev.angelcorzo.nivo.jpa.parkinglots.ParkingLotsData;
import dev.angelcorzo.nivo.jpa.parkingtickets.ParkingTicketsData;
import dev.angelcorzo.nivo.jpa.tenants.TenantsData;
import dev.angelcorzo.nivo.model.rates.enums.TimeUnitsRate;
import dev.angelcorzo.nivo.model.rates.enums.VehicleType;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "rates")
@Entity
@SQLRestriction(value = "deleted_at IS NULL")
@SQLDelete(sql = "UPDATE rates SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
public class RateData {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parking_lot_id", referencedColumnName = "id", nullable = false)
  private ParkingLotsData parking;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tenant_id", referencedColumnName = "id", nullable = false)
  private TenantsData tenant;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "description", nullable = false)
  private String description;

  @Column(name = "price_per_unit", nullable = false)
  private BigDecimal pricePerUnit;

  @Column(name = "time_unit", nullable = false)
  @Enumerated(EnumType.STRING)
  private TimeUnitsRate timeUnit;

  @Column(name = "min_charge_time_minutes")
  @ColumnDefault(value = "0")
  private Integer minChargeTimeMinutes;

  @Column(name = "vehicle_type", nullable = false)
  @Enumerated(EnumType.STRING)
  private VehicleType vehicleType;

  @Column(name = "created_at")
  @CreationTimestamp
  private OffsetDateTime createdAt;

  @Column(name = "updated_at")
  @UpdateTimestamp
  private OffsetDateTime updatedAt;

  @Column(name = "deleted_at")
  private OffsetDateTime deleted_at;

  @OneToMany(mappedBy = "rate", fetch = FetchType.LAZY)
  private List<ParkingTicketsData> tickets;
}
