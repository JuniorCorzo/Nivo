package dev.angelcorzo.nivo.api.notificationpreferences.controller;

import dev.angelcorzo.nivo.api.commons.dto.Response;
import dev.angelcorzo.nivo.api.notificationpreferences.dto.NotificationPreferencesDTO;
import dev.angelcorzo.nivo.api.notificationpreferences.enums.NotificationPreferencesMessages;
import dev.angelcorzo.nivo.api.notificationpreferences.mappers.NotificationPreferencesMapper;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.usecase.getnotificationpreferencesbyuser.GetNotificationPreferencesByUserUseCase;
import dev.angelcorzo.nivo.usecase.updateusernotificationpreferences.UpdateUserNotificationPreferencesUseCase;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for Notification Preferences endpoints.
 *
 * <p>Exposes two operations scoped to the authenticated user:
 *
 * <ul>
 *   <li>{@code GET /notification-preferences} — retrieves all preferences of the current user.
 *   <li>{@code PATCH /notification-preferences/toggle} — toggles the {@code isEnabled} flag for a
 *       specific event/channel combination, identified via query parameters.
 * </ul>
 *
 * <p><strong>Layer:</strong> Infrastructure (Entry Point - REST)
 *
 * @author Angel Corzo
 * @since 1.0.0
 */
@RestController
@RequestMapping("/notification-preferences")
@Tag(name = "Notification Preferences", description = "Notification Preferences API")
@RequiredArgsConstructor
public class NotificationPreferencesController {

  private final NotificationPreferencesMapper notificationPreferencesMapper;
  private final GetNotificationPreferencesByUserUseCase getNotificationPreferencesByUserUseCase;
  private final UpdateUserNotificationPreferencesUseCase updateUserNotificationPreferencesUseCase;

  /**
   * Returns all notification preferences belonging to the authenticated user.
   *
   * @return A {@link Response} wrapping the list of {@link NotificationPreferencesDTO}.
   */
  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public Response<List<NotificationPreferencesDTO>> getNotificationPreferences() {
    final List<NotificationPreferencesDTO> preferences =
        this.getNotificationPreferencesByUserUseCase.execute().stream()
            .map(this.notificationPreferencesMapper::toDTO)
            .toList();

    return Response.ok(
        preferences, NotificationPreferencesMessages.NOTIFICATION_PREFERENCES_LIST.format());
  }

  /**
   * Toggles the {@code isEnabled} status of a notification preference for the authenticated user.
   *
   * <p>The target preference is identified by the {@code event} and {@code channel} query
   * parameters. The method returns the new boolean state after the toggle.
   *
   * @param event The {@link NotificationEvents} of the preference to toggle.
   * @param channel The {@link NotificationsChannel} of the preference to toggle.
   * @return A {@link Response} wrapping the new {@code isEnabled} value ({@code true}/{@code
   *     false}).
   */
  @PatchMapping("/toggle")
  @PreAuthorize("isAuthenticated()")
  public Response<Boolean> toggleNotificationPreference(
      @RequestParam("event") NotificationEvents event,
      @RequestParam("channel") NotificationsChannel channel) {
    final boolean newStatus =
        this.updateUserNotificationPreferencesUseCase.toggleActiveStatus(event, channel);

    return Response.ok(
        newStatus, NotificationPreferencesMessages.NOTIFICATION_PREFERENCES_TOGGLED.format());
  }
}
