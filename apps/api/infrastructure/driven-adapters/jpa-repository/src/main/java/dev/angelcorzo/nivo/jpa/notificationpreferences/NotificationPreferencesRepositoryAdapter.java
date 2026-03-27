package dev.angelcorzo.nivo.jpa.notificationpreferences;

import dev.angelcorzo.nivo.jpa.helper.AdapterOperations;
import dev.angelcorzo.nivo.jpa.notificationpreferences.mapper.NotificationPreferencesMapper;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationpreferences.NotificationPreferences;
import dev.angelcorzo.nivo.model.notificationpreferences.gateways.NotificationPreferencesRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * JPA adapter for {@link NotificationPreferencesRepository}.
 *
 * <p>This class implements the {@link NotificationPreferencesRepository} gateway interface,
 * providing concrete persistence operations for {@link NotificationPreferences} entities using
 * Spring Data JPA.
 *
 * <p>It extends {@link AdapterOperations} to leverage common CRUD and mapping functionalities.
 *
 * <p><strong>Layer:</strong> Infrastructure (Driven Adapter - JPA)
 *
 * <p><strong>Responsibility:</strong> To provide persistence implementation for Notification
 * Preference domain operations.
 *
 * @author Angel Corzo
 * @since 1.0.0
 * @see NotificationPreferencesRepository
 * @see NotificationPreferencesData
 * @see NotificationPreferencesMapper
 * @see AdapterOperations
 */
@Repository
public class NotificationPreferencesRepositoryAdapter
    extends AdapterOperations<
        NotificationPreferences,
        NotificationPreferencesData,
        UUID,
        NotificationPreferencesRepositoryData>
    implements NotificationPreferencesRepository {

  /**
   * Constructs a new {@code NotificationPreferencesRepositoryAdapter}.
   *
   * @param repository The Spring Data JPA repository for {@link NotificationPreferencesData}.
   * @param mapper The MapStruct mapper for {@link NotificationPreferences}.
   */
  protected NotificationPreferencesRepositoryAdapter(
      final NotificationPreferencesRepositoryData repository,
      final NotificationPreferencesMapper mapper) {
    super(repository, mapper);
  }

  /**
   * Checks whether a notification preference is enabled for the given event type, delivery channel,
   * and recipient address.
   *
   * <p>The {@code to} parameter is treated as the user's <em>email address</em>, which serves as
   * the primary contact identifier in the Nivo domain regardless of the delivery channel
   * (EMAIL or WHATSAPP). This allows the notification dispatch layer to use a single lookup key
   * without needing to know which field to query per channel.
   *
   * @param event The {@link NotificationEvents} to evaluate.
   * @param channel The {@link NotificationsChannel} to evaluate.
   * @param to The email address of the target user.
   * @return {@code true} if an active preference record exists matching all three criteria, {@code
   *     false} otherwise.
   */
  @Override
  @Transactional(readOnly = true)
  public boolean isEnable(
      final NotificationEvents event, final NotificationsChannel channel, final String to) {
    return this.repository.existsByEventTypeAndChannelAndUser_EmailAndIsEnabledTrue(
        event, channel, to);
  }

  /**
   * Retrieves all notification preferences belonging to the given user.
   *
   * @param userId The UUID of the user whose preferences are requested.
   * @return A list of {@link NotificationPreferences} domain entities.
   */
  @Override
  @Transactional(readOnly = true)
  public List<NotificationPreferences> findAllByUserId(final UUID userId) {
    return this.repository.findAllByUser_Id(userId).stream().map(this.mapper::toEntity).toList();
  }

  /**
   * Toggles the {@code isEnabled} flag of a notification preference identified by the combination
   * of user, event type, and channel.
   *
   * <p>If no matching record exists the method returns {@code false} without throwing an exception,
   * letting the caller decide how to handle the missing preference.
   *
   * @param userId The UUID of the user whose preference must be toggled.
   * @param event The {@link NotificationEvents} type to match.
   * @param channel The {@link NotificationsChannel} to match.
   * @return The <em>new</em> value of {@code isEnabled} after the toggle, or {@code false} if no
   *     matching preference was found.
   */
  @Override
  @Transactional
  public boolean toggleActiveStatus(
      final UUID userId, final NotificationEvents event, final NotificationsChannel channel) {
    return this.repository
        .findByUser_IdAndEventTypeAndChannel(userId, event, channel)
        .map(
            preference -> {
              final boolean newStatus = !Boolean.TRUE.equals(preference.getIsEnabled());
              preference.setIsEnabled(newStatus);
              this.repository.save(preference);
              return newStatus;
            })
        .orElse(false);
  }
}
