package dev.angelcorzo.nivo.jpa.userinvitation;

import dev.angelcorzo.nivo.jpa.tenants.TenantsData;
import dev.angelcorzo.nivo.jpa.users.UsersData;
import dev.angelcorzo.nivo.model.userinvitations.UserInvitationStatus;
import dev.angelcorzo.nivo.model.users.enums.Roles;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.proxy.HibernateProxy;

/**
 * Represents the JPA data entity for a User Invitation.
 *
 * <p>This class maps to the "user_invitations" table in the database and includes fields for
 * tracking the invitation details, status, and auditing information.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA)
 *
 * <p><strong>Responsibility:</strong> To persist and retrieve User Invitation data from the
 * database.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see TenantsData
 * @see UsersData
 * @see UserInvitationStatus
 * @see Roles
 */
@Builder(toBuilder = true)
@Getter
@Setter
@ToString
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "user_invitations")
@SQLDelete(sql = "UPDATE user_invitations SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction(value = "deleted_at IS NULL")
public class UserInvitationsData {
  /** Unique identifier for the user invitation. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  /** The tenant to which the user is invited. */
  @ManyToOne(fetch = FetchType.LAZY, targetEntity = TenantsData.class)
  @JoinColumn(
      name = "tenant_id",
      foreignKey = @ForeignKey(name = "user_invitations_tenant_id_fkey"),
      nullable = false)
  @ToString.Exclude
  private TenantsData tenant;

  /** The email address of the person being invited. */
  @Column(name = "invited_email", nullable = false)
  private String invitedEmail;

  /** The role to be assigned to the user upon accepting the invitation. */
  @Column(name = "role", nullable = false)
  @Enumerated(EnumType.STRING)
  private Roles role;

  /** The unique token associated with this invitation for acceptance. */
  @Column(name = "token", nullable = false)
  private UUID token;

  /** The current status of the invitation (e.g., PENDING, ACCEPTED, EXPIRED). */
  @Column(name = "status", nullable = false)
  @Enumerated(EnumType.STRING)
  private UserInvitationStatus status;

  /** The user who sent this invitation. */
  @ManyToOne(fetch = FetchType.LAZY, targetEntity = UsersData.class)
  @JoinColumn(name = "invited_by")
  @ToString.Exclude
  private UsersData invitedBy;

  /** Timestamp when the invitation was created. */
  @Column(name = "created_at", columnDefinition = "TIMESTAMPTZ")
  @CreationTimestamp
  private OffsetDateTime createdAt;

  /** Timestamp when the invitation was accepted. */
  @Column(name = "accepted_at", columnDefinition = "TIMESTAMPTZ")
  private OffsetDateTime acceptedAt;

  /** Timestamp when the invitation expires. */
  @Column(name = "expired_at", columnDefinition = "TIMESTAMPTZ")
  private OffsetDateTime expiredAt;

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
    UserInvitationsData that = (UserInvitationsData) o;
    return getId() != null && Objects.equals(getId(), that.getId());
  }

  @Override
  public final int hashCode() {
    return this instanceof HibernateProxy
        ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode()
        : getClass().hashCode();
  }
}
