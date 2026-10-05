package dev.angelcorzo.nivo.infrastructure.adapter.jpa.slot;

import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkinglots.ParkingLotsData;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.parkingtickets.ParkingTicketsData;
import dev.angelcorzo.nivo.infrastructure.adapter.jpa.tenants.TenantsData;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.domain.model.slots.enums.SlotType;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.*;

@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "slots")
@Entity
@SQLRestriction(value = "deleted_at IS NULL")
@SQLDelete(sql = "UPDATE slots SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
public class SlotsData {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, targetEntity = ParkingLotsData.class)
  @JoinColumn(name = "parking_lot_id", referencedColumnName = "id", nullable = false)
  private ParkingLotsData parking;

  @ManyToOne(fetch = FetchType.LAZY, targetEntity = TenantsData.class)
  @JoinColumn(name = "tenant_id", referencedColumnName = "id", nullable = false)
  private TenantsData tenant;

  @Column(name = "slot_number", nullable = false)
  private String slotNumber;

  @Column(name = "zone")
  private String zone;

  @Column(name = "prefix")
  private String prefix;

  @ColumnDefault(value = "CAR")
  @Column(name = "type", nullable = false)
  @Enumerated(EnumType.STRING)
  private SlotType type;

  @ColumnDefault(value = "AVAILABLE")
  @Column(name = "status", nullable = false)
  @Enumerated(EnumType.STRING)
  private SlotStatus status;

  @Builder.Default
  @ColumnDefault(value = "false")
  @Column(name = "has_charger", nullable = false)
  private Boolean hasCharger = false;

  @Builder.Default
  @ColumnDefault(value = "false")
  @Column(name = "is_accessible", nullable = false)
  private Boolean isAccessible = false;

  @Builder.Default
  @ColumnDefault(value = "true")
  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;

  @CreationTimestamp
  @Column(name = "created_at")
  private OffsetDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private OffsetDateTime updatedAt;

  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;

  @OneToMany(mappedBy = "slot", fetch = FetchType.LAZY)
  private List<ParkingTicketsData> tickets;
}
