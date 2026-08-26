package dev.angelcorzo.nivo.api.notificationpreferences.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.angelcorzo.nivo.api.notificationpreferences.dto.NotificationPreferencesDTO;
import dev.angelcorzo.nivo.api.notificationpreferences.enums.NotificationPreferencesMessages;
import dev.angelcorzo.nivo.api.notificationpreferences.mappers.NotificationPreferencesMapper;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationEvents;
import dev.angelcorzo.nivo.model.commons.notifications.enums.NotificationsChannel;
import dev.angelcorzo.nivo.model.notificationpreferences.NotificationPreferences;
import dev.angelcorzo.nivo.usecase.getnotificationpreferencesbyuser.GetNotificationPreferencesByUserUseCase;
import dev.angelcorzo.nivo.usecase.updateusernotificationpreferences.UpdateUserNotificationPreferencesUseCase;
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
@WebMvcTest(NotificationPreferencesController.class)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = NotificationPreferencesController.class)
@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationPreferencesController Unit Tests")
class NotificationPreferencesControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private NotificationPreferencesMapper notificationPreferencesMapper;
  @MockitoBean private GetNotificationPreferencesByUserUseCase getNotificationPreferencesByUserUseCase;
  @MockitoBean private UpdateUserNotificationPreferencesUseCase updateUserNotificationPreferencesUseCase;

  @Test
  @DisplayName("GET /notification-preferences - Should get user preferences")
  void shouldGetPreferences() throws Exception {
    NotificationPreferences pref = NotificationPreferences.builder().build();
    NotificationPreferencesDTO dto = mock(NotificationPreferencesDTO.class);

    when(getNotificationPreferencesByUserUseCase.execute()).thenReturn(List.of(pref));
    when(notificationPreferencesMapper.toDTO(pref)).thenReturn(dto);

    mockMvc
        .perform(get("/notification-preferences"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value(NotificationPreferencesMessages.NOTIFICATION_PREFERENCES_LIST.format()));
  }

  @Test
  @DisplayName("PATCH /notification-preferences/toggle - Should toggle preference")
  void shouldTogglePreference() throws Exception {
    when(updateUserNotificationPreferencesUseCase.toggleActiveStatus(
            NotificationEvents.TICKET_OPENED, NotificationsChannel.EMAIL))
        .thenReturn(true);

    mockMvc
        .perform(
            patch("/notification-preferences/toggle")
                .param("event", "TICKET_OPENED")
                .param("channel", "EMAIL"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value(NotificationPreferencesMessages.NOTIFICATION_PREFERENCES_TOGGLED.format()))
        .andExpect(jsonPath("$.data").value(true));
  }
}
