package dev.angelcorzo.nivo.jpa.parkingtickets;

import dev.angelcorzo.nivo.jpa.rates.RateData;
import dev.angelcorzo.nivo.jpa.slot.SlotsData;
import dev.angelcorzo.nivo.jpa.tenants.TenantsData;
import dev.angelcorzo.nivo.jpa.users.UsersData;
import dev.angelcorzo.nivo.model.parkingtickets.enums.ParkingTicketStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(
    name = "parking_tickets",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uq_parking_ticket_tenant_id",
            columnNames = {"tenant_id", "id"}))
@Entity()
public class ParkingTicketsData {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "slot_id", referencedColumnName = "id", nullable = false)
  private SlotsData slot;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tenant_id", referencedColumnName = "id", nullable = false)
  private TenantsData tenant;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private UsersData user;

  @Column(name = "license_plate")
  private String licensePlate;

  @Column(name = "entry_time", nullable = false, columnDefinition = "TIMESTAMPTZ")
  private OffsetDateTime entryTime;

  @Column(name = "exit_time", columnDefinition = "TIMESTAMPTZ")
  private OffsetDateTime exitTime;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "rate_id", referencedColumnName = "id", nullable = false)
  private RateData rate;

  @Column(name = "total_to_charge")
  private BigDecimal totalToCharge;

  @Column(name = "status")
  @ColumnDefault(value = "OPEN")
  @Enumerated(EnumType.STRING)
  private ParkingTicketStatus status;

  @Column(name = "closed_at", columnDefinition = "TIMESTAMPTZ")
  private OffsetDateTime closedAt;

  @Column(name = "created_at", columnDefinition = "TIMESTAMPTZ")
  @CreationTimestamp
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", columnDefinition = "TIMESTAMPTZ")
  @UpdateTimestamp
  private OffsetDateTime updatedAt;

  @Column(name = "deleted_at", columnDefinition = "TIMESTAMPTZ")
  private OffsetDateTime deleted_at;
}
