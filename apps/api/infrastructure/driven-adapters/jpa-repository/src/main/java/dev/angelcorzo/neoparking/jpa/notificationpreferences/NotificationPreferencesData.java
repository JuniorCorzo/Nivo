package dev.angelcorzo.neoparking.jpa.notificationpreferences;

import dev.angelcorzo.neoparking.jpa.tenants.TenantsData;
import dev.angelcorzo.neoparking.jpa.users.UsersData;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.proxy.HibernateProxy;

/**
 * Represents the JPA data entity for a Notification Preference.
 *
 * <p>This class maps to the {@code notification_preferences} table in the database and
 * stores per-user, per-event, per-channel notification opt-in/opt-out preferences.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA)
 *
 * <p><strong>Responsibility:</strong> To persist and retrieve Notification Preference data from
 * the database.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see UsersData
 * @see TenantsData
 * @see NotificationEvents
 * @see NotificationsChannel
 */
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(
    name = "notification_preferences",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uq_notification_preference_user_event_channel",
            columnNames = {"user_id", "event_type", "channel"}))
public class NotificationPreferencesData {

  /** Unique identifier for the notification preference. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  /** The user this preference belongs to. */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(
      name = "user_id",
      referencedColumnName = "id",
      nullable = false,
      foreignKey = @ForeignKey(name = "notification_preferences_user_id_fkey"))
  @ToString.Exclude
  private UsersData user;

  /** The tenant this preference is scoped to. */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(
      name = "tenant_id",
      referencedColumnName = "id",
      nullable = false,
      foreignKey = @ForeignKey(name = "notification_preferences_tenant_id_fkey"))
  @ToString.Exclude
  private TenantsData tenant;

  /** The type of event that triggers this notification. */
  @Column(name = "event_type", nullable = false, length = 50)
  @Enumerated(EnumType.STRING)
  private NotificationEvents eventType;

  /** The channel through which the notification is delivered. */
  @Column(name = "channel", nullable = false, length = 20)
  @Enumerated(EnumType.STRING)
  private NotificationsChannel channel;

  /** Whether this notification preference is currently active. */
  @Column(name = "is_enabled", nullable = false)
  @ColumnDefault("true")
  private Boolean isEnabled;

  /** Timestamp when the preference was created. */
  @Column(name = "created_at", updatable = false)
  @CreationTimestamp
  private OffsetDateTime createdAt;

  /** Timestamp when the preference was last updated. */
  @Column(name = "updated_at")
  @UpdateTimestamp
  private OffsetDateTime updatedAt;

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
    NotificationPreferencesData that = (NotificationPreferencesData) o;
    return getId() != null && Objects.equals(getId(), that.getId());
  }

  @Override
  public final int hashCode() {
    return this instanceof HibernateProxy
        ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode()
        : getClass().hashCode();
  }
}
