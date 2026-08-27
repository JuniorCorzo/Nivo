package dev.angelcorzo.nivo.api.notificationpreferences.controller;

import dev.angelcorzo.nivo.api.commons.dto.Response;
import dev.angelcorzo.nivo.api.notificationpreferences.dto.NotificationPreferencesDTO;
import dev.angelcorzo.nivo.api.notificationpreferences.enums.NotificationPreferencesMessages;
import dev.angelcorzo.nivo.api.notificationpreferences.mappers.NotificationPreferencesMapper;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.usecase.getnotificationpreferencesbyuser.GetNotificationPreferencesByUserUseCase;
import dev.angelcorzo.nivo.usecase.updateusernotificationpreferences.UpdateUserNotificationPreferencesUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notification-preferences")
@Tag(name = "Notification Preferences", description = "User notification preferences and channel toggles")
@RequiredArgsConstructor
public class NotificationPreferencesController {

  private final NotificationPreferencesMapper notificationPreferencesMapper;
  private final GetNotificationPreferencesByUserUseCase getNotificationPreferencesByUserUseCase;
  private final UpdateUserNotificationPreferencesUseCase updateUserNotificationPreferencesUseCase;

  @Operation(
      summary = "Get user notification preferences",
      description = "Returns all notification event and channel preferences for the authenticated user")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Preferences retrieved successfully"),
    @ApiResponse(responseCode = "401", description = "Unauthorized")
  })
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

  @Operation(
      summary = "Toggle notification preference",
      description = "Toggles enabled status for a specific notification event and communication channel")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Preference toggled successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid event or channel parameter"),
    @ApiResponse(responseCode = "401", description = "Unauthorized")
  })
  @PatchMapping("/toggle")
  @PreAuthorize("isAuthenticated()")
  public Response<Boolean> toggleNotificationPreference(
      @Parameter(description = "Notification event type", required = true) @RequestParam("event") NotificationEvents event,
      @Parameter(description = "Notification delivery channel", required = true) @RequestParam("channel") NotificationsChannel channel) {
    final boolean newStatus =
        this.updateUserNotificationPreferencesUseCase.toggleActiveStatus(event, channel);

    return Response.ok(
        newStatus, NotificationPreferencesMessages.NOTIFICATION_PREFERENCES_TOGGLED.format());
  }
}
