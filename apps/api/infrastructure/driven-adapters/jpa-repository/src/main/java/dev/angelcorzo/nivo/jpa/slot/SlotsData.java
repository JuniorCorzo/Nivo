package dev.angelcorzo.nivo.jpa.slot;

import dev.angelcorzo.nivo.jpa.parkinglots.ParkingLotsData;
import dev.angelcorzo.nivo.jpa.parkingtickets.ParkingTicketsData;
import dev.angelcorzo.nivo.jpa.tenants.TenantsData;
import dev.angelcorzo.nivo.model.slots.enums.SlotStatus;
import dev.angelcorzo.nivo.model.slots.enums.SlotType;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.*;

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
