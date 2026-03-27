package dev.angelcorzo.nivo.jpa.users;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import dev.angelcorzo.nivo.jpa.parkinglots.ParkingLotsData;
import dev.angelcorzo.nivo.jpa.parkingtickets.ParkingTicketsData;
import dev.angelcorzo.nivo.jpa.tenants.TenantsData;
import dev.angelcorzo.nivo.model.users.enums.Roles;
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
 * Represents the JPA data entity for a User.
 *
 * <p>This class maps to the "users" table in the database and includes auditing fields for
 * creation, update, and soft deletion.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA)
 *
 * <p><strong>Responsibility:</strong> To persist and retrieve User data from the database.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see TenantsData
 * @see Roles
 */
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "users")
@SQLDelete(sql = "UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction(value = "deleted_at IS NULL")
public class UsersData {
  /** Unique identifier for the user. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  /** The full name of the user. */
  @Column(name = "full_name", nullable = false)
  private String fullName;

  /** The email address of the user. Must be unique. */
  @Column(name = "email", nullable = false)
  private String email;

  /** The hashed password of the user. */
  @Column(name = "password", nullable = false)
  private String password;

  /** The role of the user within the tenant. */
  @Column(name = "role", nullable = false)
  @Enumerated(EnumType.STRING)
  private Roles role;

  /** The tenant to which this user belongs. */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(
      name = "tenant_id",
      referencedColumnName = "id",
      foreignKey = @ForeignKey(name = "users_tenant_id_fkey"))
  @JsonBackReference("user-tenant")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private TenantsData tenant;

  /** Additional contact information for the user. */
  @Column(name = "contact_info")
  private String contactInfo;

  /** The ID of the user who performed the soft deletion. */
  @Column(name = "deleted_by")
  private UUID deletedBy;

  /** Timestamp when the user record was created. */
  @CreationTimestamp
  @Column(name = "created_at")
  private OffsetDateTime createdAt;

  /** Timestamp when the user record was last updated. */
  @UpdateTimestamp
  @Column(name = "updated_at")
  private OffsetDateTime updatedAt;

  /** Timestamp when the user record was soft deleted. */
  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;

  @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY, targetEntity = ParkingLotsData.class)
  @JsonManagedReference("parking-lot-owner")
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<ParkingLotsData> parkingLots;

  @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, targetEntity = ParkingTicketsData.class)
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
    UsersData usersData = (UsersData) o;
    return getId() != null && Objects.equals(getId(), usersData.getId());
  }

  @Override
  public final int hashCode() {
    return this instanceof HibernateProxy
        ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode()
        : getClass().hashCode();
  }
}
