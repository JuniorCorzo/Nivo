package dev.angelcorzo.nivo.jpa.notificationlogs;

import dev.angelcorzo.nivo.jpa.notificationtemplates.NotificationTemplatesData;
import dev.angelcorzo.nivo.jpa.tenants.TenantsData;
import dev.angelcorzo.nivo.jpa.users.UsersData;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationlogs.enums.NotificationLogsStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "notification_logs")
public class NotificationLogsData {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tenant_id", referencedColumnName = "id", nullable = false)
  private TenantsData tenant;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "actor_user_id", referencedColumnName = "id", nullable = false)
  private UsersData actorUser;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "recipient_user_id", referencedColumnName = "id")
  private UsersData recipientUser;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "template_id", referencedColumnName = "id")
  private NotificationTemplatesData template;

  @Column(name = "event_type", nullable = false, length = 50)
  @Enumerated(EnumType.STRING)
  private NotificationEvents eventType;

  @Column(name = "channel", nullable = false, length = 20)
  @Enumerated(EnumType.STRING)
  private NotificationsChannel channel;

  @Column(name = "recipient", nullable = false)
  private String recipient;

  @Column(name = "subject")
  private String subject;

  @Column(name = "body", columnDefinition = "text")
  private String body;

  @Column(name = "status", nullable = false, length = 20)
  @ColumnDefault("'PENDING'")
  @Enumerated(EnumType.STRING)
  private NotificationLogsStatus status;

  @Column(name = "error_message", columnDefinition = "text")
  private String errorMessage;

  @Column(name = "sent_at", columnDefinition = "TIMESTAMPTZ")
  private OffsetDateTime sentAt;

  @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMPTZ")
  @CreationTimestamp
  private OffsetDateTime createdAt;
}
