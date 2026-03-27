package dev.angelcorzo.nivo.jpa.tenants;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import dev.angelcorzo.nivo.jpa.parkinglots.ParkingLotsData;
import dev.angelcorzo.nivo.jpa.parkingtickets.ParkingTicketsData;
import dev.angelcorzo.nivo.jpa.rates.RateData;
import dev.angelcorzo.nivo.jpa.slot.SlotsData;
import dev.angelcorzo.nivo.jpa.specialpolicies.SpecialPoliciesData;
import dev.angelcorzo.nivo.jpa.users.UsersData;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.proxy.HibernateProxy;

/**
 * Represents the JPA data entity for a Tenant.
 *
 * <p>This class maps to the "tenants" table in the database and includes auditing fields for
 * creation, update, and soft deletion. It also defines the relationship with {@link UsersData}.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA)
 *
 * <p><strong>Responsibility:</strong> To persist and retrieve Tenant data from the database.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see UsersData
 */
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "tenants")
@SQLRestriction(value = "deleted_at IS NULL")
@SQLDelete(sql = "UPDATE tenants SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
public class TenantsData {
  /** Unique identifier for the tenant. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  /** The legal or commercial name of the company representing the tenant. */
  @Column(name = "company_name", nullable = false)
  private String companyName;

  /** Timestamp when the tenant record was created. */
  @Column(name = "created_at")
  @CreationTimestamp
  private OffsetDateTime createdAt;

  /** Timestamp when the tenant record was last updated. */
  @Column(name = "updated_at")
  @UpdateTimestamp
  private OffsetDateTime updatedAt;

  /** Timestamp when the tenant record was softly deleted. */
  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;

  /**
   * List of users associated with this tenant. This is a one-to-many relationship, mapped by the
   * "tenant" field in {@link UsersData}.
   */
  @OneToMany(mappedBy = "tenant", fetch = FetchType.LAZY, targetEntity = UsersData.class)
  @JsonManagedReference("user-tenant")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<UsersData> users;

  @OneToMany(mappedBy = "tenant", fetch = FetchType.LAZY, targetEntity = ParkingLotsData.class)
  @JsonManagedReference("parking-lot-tenant")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<ParkingLotsData> parkingLots;

  @OneToMany(mappedBy = "tenant", fetch = FetchType.LAZY)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<SlotsData> slots;

  @OneToMany(mappedBy = "tenant", fetch = FetchType.LAZY)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<RateData> rates;

  @OneToMany(mappedBy = "tenant", fetch = FetchType.LAZY)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<SpecialPoliciesData> special_policies;

  @OneToMany(mappedBy = "tenant", fetch = FetchType.LAZY)
  @ToString.Exclude
  private List<ParkingTicketsData> tickets;

  @Override
  public final boolean equals(Object o) {
    if (this == o) return true;
    if (o == null) return false;
    Class<?> oEffectiveClass =
        o instanceof HibernateProxy
            ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass()
            : o.getClass();
    Class<?> thisEffectiveClass =
        this instanceof HibernateProxy
            ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass()
            : this.getClass();
    if (thisEffectiveClass != oEffectiveClass) return false;
    TenantsData that = (TenantsData) o;
    return getId() != null && Objects.equals(getId(), that.getId());
  }

  @Override
  public final int hashCode() {
    return this instanceof HibernateProxy
        ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode()
        : getClass().hashCode();
  }
}
