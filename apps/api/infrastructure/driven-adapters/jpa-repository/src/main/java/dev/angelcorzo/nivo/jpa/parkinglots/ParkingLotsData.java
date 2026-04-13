package dev.angelcorzo.nivo.jpa.parkinglots;

import com.fasterxml.jackson.annotation.JsonBackReference;
import dev.angelcorzo.nivo.jpa.rates.RateData;
import dev.angelcorzo.nivo.jpa.slot.SlotsData;
import dev.angelcorzo.nivo.jpa.tenants.TenantsData;
import dev.angelcorzo.nivo.jpa.users.UsersData;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.*;
import org.hibernate.type.SqlTypes;
import org.hibernate.proxy.HibernateProxy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Builder(toBuilder = true)
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "parking_lots")
@Entity
@SQLDelete(sql = "UPDATE parking_lots SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction(value = "deleted_at IS NULL")
public class ParkingLotsData {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @JdbcTypeCode(SqlTypes.STRUCT)
  private AddressType address;

  @Column(name = "name", nullable = false)
  private String name;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id", referencedColumnName = "id", nullable = false)
  @JsonBackReference("parking-lot-owner")
  @ToString.Exclude
  private UsersData owner;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tenant_id", referencedColumnName = "id", nullable = false)
  @JsonBackReference("parking-lot-tenant")
  @ToString.Exclude
  private TenantsData tenant;

  @ColumnDefault("UTC-5")
  @Column(name = "timezone")
  private String timezone;

  @ColumnDefault("COP")
  @Column(name = "currency")
  private String currency;

  @Column(name = "operating_hours")
  @JdbcTypeCode(SqlTypes.STRUCT)
  private OperatingHoursType operatingHours;

  @CreationTimestamp
  @Column(name = "created_at")
  private OffsetDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private OffsetDateTime updatedAt;

  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;

  @OneToMany(mappedBy = "parking", fetch = FetchType.LAZY, targetEntity = SlotsData.class)
  @ToString.Exclude
  private List<SlotsData> slots;

  @OneToMany(mappedBy = "parking", fetch = FetchType.LAZY)
  @ToString.Exclude
  private List<RateData> rates;

  @Override
  public final boolean equals(Object o) {
    if (this == o) return true;
    if (o == null) return false;
    Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
    Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
    if (thisEffectiveClass != oEffectiveClass) return false;
    ParkingLotsData that = (ParkingLotsData) o;
    return getId() != null && Objects.equals(getId(), that.getId());
  }

  @Override
  public final int hashCode() {
    return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
  }
}
