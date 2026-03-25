package dev.angelcorzo.neoparking.jpa.notificationpreferences;

import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.neoparking.model.commons.notifications.enums.NotificationsChannel;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link NotificationPreferencesData} entities.
 *
 * <p>Provides standard CRUD operations and derived query methods used to evaluate whether a
 * specific notification preference is active for a given user (identified by email), event type,
 * and delivery channel; and to retrieve or toggle preferences per user.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA Repository)
 *
 * <p><strong>Responsibility:</strong> To interact with the {@code notification_preferences} table
 * for persistence operations.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see NotificationPreferencesData
 */
public interface NotificationPreferencesRepositoryData
    extends JpaRepository<NotificationPreferencesData, UUID> {

  /**
   * Checks whether an active notification preference exists for a given event type, delivery
   * channel, and user email address.
   *
   * <p>The {@code to} parameter from the gateway's {@code isEnable} method maps to the user's
   * {@code email} field, which is the primary contact identifier used when dispatching both EMAIL
   * and WHATSAPP notifications in the NeoParking domain.
   *
   * @param eventType The notification event to check.
   * @param channel The delivery channel to check.
   * @param email The email address of the target user.
   * @return {@code true} if a matching enabled preference is found, {@code false} otherwise.
   */
  boolean existsByEventTypeAndChannelAndUser_EmailAndIsEnabledTrue(
      NotificationEvents eventType, NotificationsChannel channel, String email);

  /**
   * Retrieves all notification preferences for the given user.
   *
   * @param userId The UUID of the target user.
   * @return A list of {@link NotificationPreferencesData} belonging to that user.
   */
  List<NotificationPreferencesData> findAllByUser_Id(UUID userId);

  /**
   * Finds a single notification preference by user, event type, and channel.
   *
   * <p>Used by {@code toggleActiveStatus} to load the preference before flipping its
   * {@code isEnabled} flag.
   *
   * @param userId The UUID of the target user.
   * @param eventType The notification event to look up.
   * @param channel The delivery channel to look up.
   * @return An {@link Optional} containing the matching preference, or empty if none exists.
   */
  Optional<NotificationPreferencesData> findByUser_IdAndEventTypeAndChannel(
      UUID userId, NotificationEvents eventType, NotificationsChannel channel);
}
