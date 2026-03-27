package dev.angelcorzo.nivo.api.notificationlogs.controller;

import dev.angelcorzo.nivo.api.commons.dto.Response;
import dev.angelcorzo.nivo.api.notificationlogs.dto.NotificationLogsDTO;
import dev.angelcorzo.nivo.api.notificationlogs.enums.NotificationLogsMessages;
import dev.angelcorzo.nivo.api.notificationlogs.mappers.NotificationLogsMapper;
import dev.angelcorzo.nivo.model.notificationlogs.NotificationLogs;
import dev.angelcorzo.nivo.usecase.getnotificationshistory.GetNotificationsHistoryUseCase;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notification-logs")
@Tag(name = "Notification Logs", description = "Notification Logs API")
@RequiredArgsConstructor
public class NotificationLogsController {
  private final NotificationLogsMapper notificationLogsMapper;
  private final GetNotificationsHistoryUseCase getNotificationsHistoryUseCase;

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
