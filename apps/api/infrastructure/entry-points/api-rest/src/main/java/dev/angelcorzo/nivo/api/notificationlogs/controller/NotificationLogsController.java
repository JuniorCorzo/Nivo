package dev.angelcorzo.nivo.api.notificationlogs.controller;

import dev.angelcorzo.nivo.api.commons.dto.Response;
import dev.angelcorzo.nivo.api.notificationlogs.dto.NotificationLogsDTO;
import dev.angelcorzo.nivo.api.notificationlogs.enums.NotificationLogsMessages;
import dev.angelcorzo.nivo.api.notificationlogs.mappers.NotificationLogsMapper;
import dev.angelcorzo.nivo.model.notificationlogs.NotificationLogs;
import dev.angelcorzo.nivo.usecase.getnotificationshistory.GetNotificationsHistoryUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notification-logs")
@Tag(name = "Notification Logs", description = "Notification history and delivery logs")
@RequiredArgsConstructor
public class NotificationLogsController {
  private final NotificationLogsMapper notificationLogsMapper;
  private final GetNotificationsHistoryUseCase getNotificationsHistoryUseCase;

  @Operation(
      summary = "Get notification history",
      description = "Retrieves the history of sent notification logs for the authenticated user/tenant")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Notification logs retrieved successfully"),
    @ApiResponse(responseCode = "401", description = "Unauthorized")
  })
  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public Response<List<NotificationLogsDTO>> getNotificationsHistory() {
    final List<NotificationLogsDTO> logs =
        this.getNotificationsHistoryUseCase.execute().stream()
            .map(this.notificationLogsMapper::toDTO)
            .toList();

    return Response.ok(logs, NotificationLogsMessages.NOTIFICATION_LOGS_LIST.format());
  }
}
