package dev.angelcorzo.nivo.api.notificationlogs.controller;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.angelcorzo.nivo.api.notificationlogs.dto.NotificationLogsDTO;
import dev.angelcorzo.nivo.api.notificationlogs.enums.NotificationLogsMessages;
import dev.angelcorzo.nivo.api.notificationlogs.mappers.NotificationLogsMapper;
import dev.angelcorzo.nivo.model.notificationlogs.NotificationLogs;
import dev.angelcorzo.nivo.usecase.getnotificationshistory.GetNotificationsHistoryUseCase;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
@WebMvcTest(NotificationLogsController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = NotificationLogsController.class)
@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationLogsController Unit Tests")
class NotificationLogsControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private NotificationLogsMapper notificationLogsMapper;
  @MockitoBean private GetNotificationsHistoryUseCase getNotificationsHistoryUseCase;

  @Test
  @DisplayName("GET /notification-logs - Should retrieve notification history")
  void shouldGetNotificationHistory() throws Exception {
    NotificationLogs log = NotificationLogs.builder().build();
    NotificationLogsDTO dto = mock(NotificationLogsDTO.class);

    when(getNotificationsHistoryUseCase.execute()).thenReturn(List.of(log));
    when(notificationLogsMapper.toDTO(log)).thenReturn(dto);

    mockMvc
        .perform(get("/notification-logs"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value(NotificationLogsMessages.NOTIFICATION_LOGS_LIST.format()));
  }
}
